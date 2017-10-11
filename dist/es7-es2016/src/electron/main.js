"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const path = require("path");
const UrlUtils_1 = require("../../../es8-es2017/src/_utils/http/UrlUtils");
const debug_ = require("debug");
const electron_1 = require("electron");
const filehound = require("filehound");
const portfinder = require("portfinder");
const server_1 = require("../http/server");
const init_globals_1 = require("../init-globals");
const events_1 = require("./common/events");
const sessions_1 = require("./common/sessions");
init_globals_1.initGlobals();
const debug = debug_("r2:electron:main");
let _publicationsServer;
let _publicationsServerPort;
let _publicationsRootUrl;
let _publicationsFilePaths;
let _publicationsUrls;
let _electronBrowserWindows;
const defaultBookPath = fs.realpathSync(path.resolve("./misc/epubs/"));
let lastBookPath;
electron_1.app.on("web-contents-created", (_evt, wc) => {
    if (!_electronBrowserWindows || !_electronBrowserWindows.length) {
        return;
    }
    _electronBrowserWindows.forEach((win) => {
        if (wc.hostWebContents &&
            wc.hostWebContents.id === win.webContents.id) {
            debug("WEBVIEW web-contents-created");
            wc.on("will-navigate", (event, url) => {
                debug("webview.getWebContents().on('will-navigate'");
                debug(url);
                const wcUrl = event.sender.getURL();
                debug(wcUrl);
                event.preventDefault();
                win.webContents.send(events_1.R2_EVENT_LINK, url);
            });
        }
    });
});
function openAllDevTools() {
    for (const wc of electron_1.webContents.getAllWebContents()) {
        wc.openDevTools();
    }
}
electron_1.ipcMain.on(events_1.R2_EVENT_DEVTOOLS, (_event, _arg) => {
    openAllDevTools();
});
electron_1.ipcMain.on(events_1.R2_EVENT_TRY_LCP_PASS, (event, publicationFilePath, lcpPass) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    debug(publicationFilePath);
    debug(lcpPass);
    let okay = false;
    try {
        okay = yield tryLcpPass(publicationFilePath, lcpPass);
    }
    catch (err) {
        debug(err);
        okay = false;
    }
    event.sender.send(events_1.R2_EVENT_TRY_LCP_PASS_RES, okay, (okay ? "LCP okay. (" + lcpPass + ")" : "LCP problem!? (" + lcpPass + ")"));
}));
function tryLcpPass(publicationFilePath, lcpPass) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const publication = _publicationsServer.cachedPublication(publicationFilePath);
        if (!publication) {
            return false;
        }
        const checkSum = crypto.createHash("sha256");
        checkSum.update(lcpPass);
        const lcpPassHex = checkSum.digest("hex");
        const okay = yield publication.LCP.setUserPassphrase(lcpPassHex);
        if (!okay) {
            debug("FAIL publication.LCP.setUserPassphrase()");
        }
        return okay;
    });
}
function createElectronBrowserWindow(publicationFilePath, publicationUrl) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug("createElectronBrowserWindow() " + publicationFilePath + " : " + publicationUrl);
        let publication;
        try {
            publication = yield _publicationsServer.loadOrGetCachedPublication(publicationFilePath);
        }
        catch (err) {
            debug(err);
        }
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
        if (!_electronBrowserWindows) {
            _electronBrowserWindows = [];
        }
        _electronBrowserWindows.push(electronBrowserWindow);
        electronBrowserWindow.webContents.on("dom-ready", () => {
            debug("electronBrowserWindow dom-ready " + publicationFilePath + " : " + publicationUrl);
        });
        electronBrowserWindow.on("closed", () => {
            debug("electronBrowserWindow closed " + publicationFilePath + " : " + publicationUrl);
            const i = _electronBrowserWindows.indexOf(electronBrowserWindow);
            if (i < 0) {
                debug("electronBrowserWindow NOT FOUND?!");
                return;
            }
            _electronBrowserWindows.splice(i, 1);
        });
        const urlEncoded = UrlUtils_1.encodeURIComponent_RFC3986(publicationUrl);
        let fullUrl = `file://${__dirname}/renderer/index.html?pub=${urlEncoded}`;
        if (lcpHint) {
            fullUrl = fullUrl + "&lcpHint=" + lcpHint;
        }
        debug(fullUrl);
        electronBrowserWindow.webContents.loadURL(fullUrl, { extraHeaders: "pragma: no-cache\n" });
    });
}
electron_1.app.on("ready", () => {
    debug("app ready");
    clearSessions(undefined, undefined);
    const sess = getWebViewSession();
    if (sess) {
        sess.setPermissionRequestHandler((wc, permission, callback) => {
            console.log("setPermissionRequestHandler");
            console.log(wc.getURL());
            console.log(permission);
            callback(true);
        });
    }
    (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        _publicationsFilePaths = yield filehound.create()
            .paths(defaultBookPath)
            .ext([".epub", ".epub3", ".cbz"])
            .find();
        debug(_publicationsFilePaths);
        _publicationsServer = new server_1.Server({
            disableDecryption: false,
            disableReaders: false,
        });
        const staticOptions = {
            etag: false,
        };
        _publicationsServer.expressUse("/readium-css", express.static("misc/ReadiumCSS", staticOptions));
        const pubPaths = _publicationsServer.addPublications(_publicationsFilePaths);
        _publicationsServerPort = yield portfinder.getPortPromise();
        _publicationsRootUrl = _publicationsServer.start(_publicationsServerPort);
        _publicationsUrls = pubPaths.map((pubPath) => {
            return `${_publicationsRootUrl}${pubPath}`;
        });
        debug(_publicationsUrls);
        resetMenu();
        process.nextTick(() => {
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
    }))();
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
        click: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const choice = electron_1.dialog.showOpenDialog({
                defaultPath: lastBookPath || defaultBookPath,
                filters: [
                    { name: "EPUB publication", extensions: ["epub", "epub3"] },
                    { name: "Comic book", extensions: ["cbz"] },
                ],
                message: "Choose a file",
                properties: ["openFile"],
                title: "Load a publication",
            });
            if (!choice || !choice.length) {
                return;
            }
            debug(choice[0]);
            lastBookPath = path.dirname(choice[0]);
            debug(lastBookPath);
            let n = _publicationsFilePaths.indexOf(choice[0]);
            if (n < 0) {
                const publicationPaths = _publicationsServer.addPublications(choice);
                debug(publicationPaths);
                _publicationsFilePaths.push(choice[0]);
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
            yield createElectronBrowserWindow(file, pubManifestUrl);
        }),
        label: "Load file...",
    });
    _publicationsUrls.forEach((pubManifestUrl, n) => {
        const file = _publicationsFilePaths[n];
        debug("MENU ITEM: " + file + " : " + pubManifestUrl);
        menuTemplate[1].submenu.push({
            click: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield createElectronBrowserWindow(file, pubManifestUrl);
            }),
            label: file,
        });
    });
    const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);
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
    return electron_1.session.fromPartition(sessions_1.R2_SESSION_WEBVIEW, { cache: false });
}
function clearWebviewSession(callbackCache, callbackStorageData) {
    const sess = getWebViewSession();
    if (sess) {
        clearSession(sess, "[persist:publicationwebview]", callbackCache, callbackStorageData);
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
//# sourceMappingURL=main.js.map