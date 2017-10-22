"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const UrlUtils_1 = require("../../_utils/http/UrlUtils");
const zipInjector_1 = require("../../_utils/zip/zipInjector");
const server_1 = require("../../http/server");
const init_globals_1 = require("../../init-globals");
const lcp_1 = require("../../parser/epub/lcp");
const debug_ = require("debug");
const electron_1 = require("electron");
const filehound = require("filehound");
const portfinder = require("portfinder");
const request = require("request");
const requestPromise = require("request-promise-native");
const ta_json_1 = require("ta-json");
const events_1 = require("../common/events");
const sessions_1 = require("../common/sessions");
const browser_window_tracker_1 = require("./browser-window-tracker");
const lcp_2 = require("./lcp");
const lsd_1 = require("./lsd");
const readium_css_1 = require("./readium-css");
init_globals_1.initGlobals();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP/lcp.node"));
const debug = debug_("r2:electron:main");
let _publicationsServer;
let _publicationsServerPort;
let _publicationsRootUrl;
let _publicationsFilePaths;
let _publicationsUrls;
const DEFAULT_BOOK_PATH = fs.realpathSync(path.resolve("./misc/epubs/"));
let _lastBookPath;
function openAllDevTools() {
    for (const wc of electron_1.webContents.getAllWebContents()) {
        wc.openDevTools();
    }
}
electron_1.ipcMain.on(events_1.R2_EVENT_DEVTOOLS, (_event, _arg) => {
    openAllDevTools();
});
async function createElectronBrowserWindow(publicationFilePath, publicationUrl) {
    debug("createElectronBrowserWindow() " + publicationFilePath + " : " + publicationUrl);
    let publication;
    try {
        publication = await _publicationsServer.loadOrGetCachedPublication(publicationFilePath);
    }
    catch (err) {
        debug(err);
    }
    if (!publication) {
        return;
    }
    await lsd_1.launchStatusDocumentProcessing(publication, publicationFilePath, lsd_1.deviceIDManager, () => {
        debug("launchStatusDocumentProcessing DONE.");
    });
    let lcpHint;
    if (publication && publication.LCP) {
        if (publication.LCP.Encryption &&
            publication.LCP.Encryption.UserKey &&
            publication.LCP.Encryption.UserKey.TextHint) {
            lcpHint = publication.LCP.Encryption.UserKey.TextHint;
        }
        if (!lcpHint) {
            lcpHint = "LCP passphrase";
        }
    }
    const electronBrowserWindow = new electron_1.BrowserWindow({
        height: 600,
        webPreferences: {
            allowRunningInsecureContent: false,
            contextIsolation: false,
            devTools: true,
            nodeIntegration: true,
            nodeIntegrationInWorker: false,
            sandbox: false,
            webSecurity: true,
            webviewTag: true,
        },
        width: 800,
    });
    browser_window_tracker_1.trackBrowserWindow(electronBrowserWindow);
    electronBrowserWindow.webContents.on("dom-ready", () => {
        debug("electronBrowserWindow dom-ready " + publicationFilePath + " : " + publicationUrl);
    });
    const urlEncoded = UrlUtils_1.encodeURIComponent_RFC3986(publicationUrl);
    let fullUrl = `file://${__dirname}/renderer/index.html?pub=${urlEncoded}`;
    if (lcpHint) {
        fullUrl = fullUrl + "&lcpHint=" + UrlUtils_1.encodeURIComponent_RFC3986(lcpHint);
    }
    debug(fullUrl);
    electronBrowserWindow.webContents.loadURL(fullUrl, { extraHeaders: "pragma: no-cache\n" });
}
electron_1.app.on("ready", () => {
    debug("app ready");
    clearSessions(undefined, undefined);
    const sess = getWebViewSession();
    if (sess) {
        sess.setPermissionRequestHandler((wc, permission, callback) => {
            debug("setPermissionRequestHandler");
            debug(wc.getURL());
            debug(permission);
            callback(true);
        });
    }
    (async () => {
        _publicationsFilePaths = await filehound.create()
            .paths(DEFAULT_BOOK_PATH)
            .ext([".epub", ".epub3", ".cbz", ".lcpl"])
            .find();
        debug(_publicationsFilePaths);
        _publicationsServer = new server_1.Server({
            disableDecryption: false,
            disableReaders: false,
        });
        lcp_2.installLcpHandler(_publicationsServer);
        readium_css_1.setupReadiumCSS(_publicationsServer, "dist/ReadiumCSS");
        const pubPaths = _publicationsServer.addPublications(_publicationsFilePaths);
        _publicationsServerPort = await portfinder.getPortPromise();
        _publicationsRootUrl = _publicationsServer.start(_publicationsServerPort);
        _publicationsUrls = pubPaths.map((pubPath) => {
            return `${_publicationsRootUrl}${pubPath}`;
        });
        debug(_publicationsUrls);
        resetMenu();
        process.nextTick(async () => {
            const args = process.argv.slice(2);
            console.log("args:");
            console.log(args);
            let filePathToLoadOnLaunch;
            if (args && args.length && args[0]) {
                const argPath = args[0].trim();
                let filePath = argPath;
                console.log(filePath);
                if (!fs.existsSync(filePath)) {
                    filePath = path.join(__dirname, argPath);
                    console.log(filePath);
                    if (!fs.existsSync(filePath)) {
                        filePath = path.join(process.cwd(), argPath);
                        console.log(filePath);
                        if (!fs.existsSync(filePath)) {
                            console.log("FILEPATH DOES NOT EXIST: " + filePath);
                        }
                        else {
                            filePathToLoadOnLaunch = filePath;
                        }
                    }
                    else {
                        filePathToLoadOnLaunch = filePath;
                    }
                }
                else {
                    filePath = fs.realpathSync(filePath);
                    console.log(filePath);
                    filePathToLoadOnLaunch = filePath;
                }
            }
            if (filePathToLoadOnLaunch) {
                await openFileDownload(filePathToLoadOnLaunch);
                return;
            }
            const detail = "Note that this is only a developer application (" +
                "test framework) for the Readium2 NodeJS 'streamer' and Electron-based 'navigator'.";
            const message = "Use the 'Electron' menu to load publications.";
            if (process.platform === "darwin") {
                const choice = electron_1.dialog.showMessageBox({
                    buttons: ["&OK"],
                    cancelId: 0,
                    defaultId: 0,
                    detail,
                    message,
                    noLink: true,
                    normalizeAccessKeys: true,
                    title: "Readium2 Electron streamer / navigator",
                    type: "info",
                });
                if (choice === 0) {
                    debug("ok");
                }
            }
            else {
                const html = `<html><h2>${message}<hr>${detail}</h2></html>`;
                const electronBrowserWindow = new electron_1.BrowserWindow({
                    height: 300,
                    webPreferences: {
                        allowRunningInsecureContent: false,
                        contextIsolation: false,
                        devTools: false,
                        nodeIntegration: false,
                        nodeIntegrationInWorker: false,
                        sandbox: false,
                        webSecurity: true,
                        webviewTag: false,
                    },
                    width: 400,
                });
                electronBrowserWindow.webContents.loadURL("data:text/html," + html);
            }
        });
    })();
});
function resetMenu() {
    const menuTemplate = [
        {
            label: "Readium2 Electron",
            submenu: [
                {
                    accelerator: "Command+Q",
                    click: () => { electron_1.app.quit(); },
                    label: "Quit",
                },
            ],
        },
        {
            label: "Open",
            submenu: [],
        },
        {
            label: "Tools",
            submenu: [
                {
                    accelerator: "Command+B",
                    click: () => {
                        openAllDevTools();
                    },
                    label: "Open Dev Tools",
                },
            ],
        },
    ];
    menuTemplate[1].submenu.push({
        click: async () => {
            const choice = electron_1.dialog.showOpenDialog({
                defaultPath: _lastBookPath || DEFAULT_BOOK_PATH,
                filters: [
                    { name: "EPUB publication", extensions: ["epub", "epub3"] },
                    { name: "LCP license", extensions: ["lcpl"] },
                    { name: "Comic book", extensions: ["cbz"] },
                ],
                message: "Choose a file",
                properties: ["openFile"],
                title: "Load a publication",
            });
            if (!choice || !choice.length) {
                return;
            }
            const filePath = choice[0];
            debug(filePath);
            await openFileDownload(filePath);
        },
        label: "Load file...",
    });
    _publicationsUrls.forEach((pubManifestUrl, n) => {
        const filePath = _publicationsFilePaths[n];
        debug("MENU ITEM: " + filePath + " : " + pubManifestUrl);
        menuTemplate[1].submenu.push({
            click: async () => {
                debug(filePath);
                await openFileDownload(filePath);
            },
            label: filePath,
        });
    });
    const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);
}
async function openFileDownload(filePath) {
    const dir = path.dirname(filePath);
    _lastBookPath = dir;
    debug(_lastBookPath);
    const ext = path.extname(filePath);
    const filename = path.basename(filePath);
    const destFileName = filename + ".epub";
    if (ext === ".lcpl") {
        const lcplStr = fs.readFileSync(filePath, { encoding: "utf8" });
        const lcplJson = global.JSON.parse(lcplStr);
        const lcpl = ta_json_1.JSON.deserialize(lcplJson, lcp_1.LCP);
        if (lcpl.Links) {
            const pubLink = lcpl.Links.find((link) => {
                return link.Rel === "publication";
            });
            if (pubLink) {
                const destPathTMP = path.join(dir, destFileName + ".tmp");
                const destPathFINAL = path.join(dir, destFileName);
                const failure = (err) => {
                    debug(err);
                    process.nextTick(() => {
                        const detail = (typeof err === "string") ?
                            err :
                            (err.toString ? err.toString() : "ERROR!?");
                        const message = "LCP EPUB download fail! [" + pubLink.Href + "]";
                        const res = electron_1.dialog.showMessageBox({
                            buttons: ["&OK"],
                            cancelId: 0,
                            defaultId: 0,
                            detail,
                            message,
                            noLink: true,
                            normalizeAccessKeys: true,
                            title: "Readium2 Electron streamer / navigator",
                            type: "info",
                        });
                        if (res === 0) {
                            debug("ok");
                        }
                    });
                };
                const success = async (response) => {
                    if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                        failure("HTTP CODE " + response.statusCode);
                        return;
                    }
                    const destStreamTMP = fs.createWriteStream(destPathTMP);
                    response.pipe(destStreamTMP);
                    destStreamTMP.on("finish", () => {
                        const zipError = (err) => {
                            debug(err);
                            process.nextTick(() => {
                                const detail = (typeof err === "string") ?
                                    err :
                                    (err.toString ? err.toString() : "ERROR!?");
                                const message = "LCP EPUB zip error! [" + destPathTMP + "]";
                                const res = electron_1.dialog.showMessageBox({
                                    buttons: ["&OK"],
                                    cancelId: 0,
                                    defaultId: 0,
                                    detail,
                                    message,
                                    noLink: true,
                                    normalizeAccessKeys: true,
                                    title: "Readium2 Electron streamer / navigator",
                                    type: "info",
                                });
                                if (res === 0) {
                                    debug("ok");
                                }
                            });
                        };
                        const doneCallback = () => {
                            setTimeout(() => {
                                fs.unlinkSync(destPathTMP);
                            }, 1000);
                            process.nextTick(async () => {
                                const detail = destPathFINAL + " ---- [" + pubLink.Href + "]";
                                const message = "LCP EPUB file download success [" + destFileName + "]";
                                const res = electron_1.dialog.showMessageBox({
                                    buttons: ["&OK"],
                                    cancelId: 0,
                                    defaultId: 0,
                                    detail,
                                    message,
                                    noLink: true,
                                    normalizeAccessKeys: true,
                                    title: "Readium2 Electron streamer / navigator",
                                    type: "info",
                                });
                                if (res === 0) {
                                    debug("ok");
                                }
                                await openFile(destPathFINAL);
                            });
                        };
                        const zipEntryPath = "META-INF/license.lcpl";
                        zipInjector_1.injectFileInZip(destPathTMP, destPathFINAL, filePath, zipEntryPath, zipError, doneCallback);
                    });
                };
                const needsStreamingResponse = true;
                if (needsStreamingResponse) {
                    request.get({
                        headers: {},
                        method: "GET",
                        uri: pubLink.Href,
                    })
                        .on("response", success)
                        .on("error", failure);
                }
                else {
                    let response;
                    try {
                        response = await requestPromise({
                            headers: {},
                            method: "GET",
                            resolveWithFullResponse: true,
                            uri: pubLink.Href,
                        });
                    }
                    catch (err) {
                        failure(err);
                        return;
                    }
                    response = response;
                    await success(response);
                }
            }
        }
    }
    else {
        await openFile(filePath);
    }
}
async function openFile(filePath) {
    let n = _publicationsFilePaths.indexOf(filePath);
    if (n < 0) {
        const publicationPaths = _publicationsServer.addPublications([filePath]);
        debug(publicationPaths);
        _publicationsFilePaths.push(filePath);
        debug(_publicationsFilePaths);
        _publicationsUrls.push(`${_publicationsRootUrl}${publicationPaths[0]}`);
        debug(_publicationsUrls);
        n = _publicationsFilePaths.length - 1;
        process.nextTick(() => {
            resetMenu();
        });
    }
    const file = _publicationsFilePaths[n];
    const pubManifestUrl = _publicationsUrls[n];
    await createElectronBrowserWindow(file, pubManifestUrl);
}
electron_1.app.on("activate", () => {
    debug("app activate");
});
electron_1.app.on("before-quit", () => {
    debug("app before quit");
});
electron_1.app.on("window-all-closed", () => {
    debug("app window-all-closed");
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
function willQuitCallback(evt) {
    debug("app will quit");
    electron_1.app.removeListener("will-quit", willQuitCallback);
    _publicationsServer.stop();
    let done = false;
    setTimeout(() => {
        if (done) {
            return;
        }
        done = true;
        debug("Cache and StorageData clearance waited enough => force quitting...");
        electron_1.app.quit();
    }, 6000);
    let sessionCleared = 0;
    const callback = () => {
        sessionCleared++;
        if (sessionCleared >= 2) {
            if (done) {
                return;
            }
            done = true;
            debug("Cache and StorageData cleared, now quitting...");
            electron_1.app.quit();
        }
    };
    clearSessions(callback, callback);
    evt.preventDefault();
}
electron_1.app.on("will-quit", willQuitCallback);
electron_1.app.on("quit", () => {
    debug("app quit");
});
function clearSession(sess, str, callbackCache, callbackStorageData) {
    sess.clearCache(() => {
        debug("SESSION CACHE CLEARED - " + str);
        if (callbackCache) {
            callbackCache();
        }
    });
    sess.clearStorageData({
        origin: "*",
        quotas: [
            "temporary",
            "persistent",
            "syncable"
        ],
        storages: [
            "appcache",
            "cookies",
            "filesystem",
            "indexdb",
            "localstorage",
            "shadercache",
            "websql",
            "serviceworkers"
        ],
    }, () => {
        debug("SESSION STORAGE DATA CLEARED - " + str);
        if (callbackStorageData) {
            callbackStorageData();
        }
    });
}
function getWebViewSession() {
    return electron_1.session.fromPartition(sessions_1.R2_SESSION_WEBVIEW, { cache: true });
}
function clearWebviewSession(callbackCache, callbackStorageData) {
    const sess = getWebViewSession();
    if (sess) {
        clearSession(sess, "[" + sessions_1.R2_SESSION_WEBVIEW + "]", callbackCache, callbackStorageData);
    }
    else {
        if (callbackCache) {
            callbackCache();
        }
        if (callbackStorageData) {
            callbackStorageData();
        }
    }
}
function clearDefaultSession(callbackCache, callbackStorageData) {
    if (electron_1.session.defaultSession) {
        clearSession(electron_1.session.defaultSession, "[default]", callbackCache, callbackStorageData);
    }
    else {
        if (callbackCache) {
            callbackCache();
        }
        if (callbackStorageData) {
            callbackStorageData();
        }
    }
}
function clearSessions(callbackCache, callbackStorageData) {
    let done = false;
    setTimeout(() => {
        if (done) {
            return;
        }
        done = true;
        debug("Cache and StorageData clearance waited enough (default session) => force webview session...");
        clearWebviewSession(callbackCache, callbackStorageData);
    }, 6000);
    let sessionCleared = 0;
    const callback = () => {
        sessionCleared++;
        if (sessionCleared >= 2) {
            if (done) {
                return;
            }
            done = true;
            debug("Cache and StorageData cleared (default session), now webview session...");
            clearWebviewSession(callbackCache, callbackStorageData);
        }
    };
    clearDefaultSession(callback, callback);
}
//# sourceMappingURL=index.js.map