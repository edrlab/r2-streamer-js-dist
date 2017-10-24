"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const path = require("path");
const UrlUtils_1 = require("../../_utils/http/UrlUtils");
const server_1 = require("../../http/server");
const init_globals_1 = require("../../init-globals");
const lcp_1 = require("../../parser/epub/lcp");
const debug_ = require("debug");
const electron_1 = require("electron");
const filehound = require("filehound");
const portfinder = require("portfinder");
const events_1 = require("../common/events");
const browser_window_tracker_1 = require("./browser-window-tracker");
const lcp_2 = require("./lcp");
const lsd_1 = require("./lsd");
const readium_css_1 = require("./readium-css");
const sessions_1 = require("./sessions");
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
        if (!publication) {
            return;
        }
        let lcpHint;
        if (publication && publication.LCP) {
            try {
                yield lsd_1.launchStatusDocumentProcessing(publication, publicationFilePath, lsd_1.deviceIDManager, () => {
                    debug("launchStatusDocumentProcessing DONE.");
                });
            }
            catch (err) {
                debug(err);
            }
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
        let fullUrl = `file://${__dirname}/../renderer/index.html?pub=${urlEncoded}`;
        if (lcpHint) {
            fullUrl = fullUrl + "&lcpHint=" + UrlUtils_1.encodeURIComponent_RFC3986(lcpHint);
        }
        debug(fullUrl);
        electronBrowserWindow.webContents.loadURL(fullUrl, { extraHeaders: "pragma: no-cache\n" });
    });
}
sessions_1.initSessions();
electron_1.app.on("ready", () => {
    debug("app ready");
    (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        _publicationsFilePaths = yield filehound.create()
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
        _publicationsServerPort = yield portfinder.getPortPromise();
        _publicationsRootUrl = _publicationsServer.start(_publicationsServerPort);
        _publicationsUrls = pubPaths.map((pubPath) => {
            return `${_publicationsRootUrl}${pubPath}`;
        });
        debug(_publicationsUrls);
        resetMenu();
        process.nextTick(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                yield openFileDownload(filePathToLoadOnLaunch);
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
        }));
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
            yield openFileDownload(filePath);
        }),
        label: "Load file...",
    });
    _publicationsUrls.forEach((pubManifestUrl, n) => {
        const filePath = _publicationsFilePaths[n];
        debug("MENU ITEM: " + filePath + " : " + pubManifestUrl);
        menuTemplate[1].submenu.push({
            click: () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                debug(filePath);
                yield openFileDownload(filePath);
            }),
            label: filePath,
        });
    });
    const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);
}
function openFileDownload(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const dir = path.dirname(filePath);
        _lastBookPath = dir;
        debug(_lastBookPath);
        const ext = path.extname(filePath);
        const filename = path.basename(filePath);
        const destFileName = filename + ".epub";
        if (ext === ".lcpl") {
            let epubFilePath;
            try {
                epubFilePath = yield lcp_2.downloadFromLCPL(filePath, dir, destFileName);
            }
            catch (err) {
                process.nextTick(() => {
                    const detail = (typeof err === "string") ?
                        err :
                        (err.toString ? err.toString() : "ERROR!?");
                    const message = "LCP EPUB download fail!]";
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
            }
            if (epubFilePath) {
                const result = epubFilePath;
                process.nextTick(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const detail = result[0] + " ---- [" + result[1] + "]";
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
                    yield openFile(result[0]);
                }));
            }
        }
        else {
            yield openFile(filePath);
        }
    });
}
function openFile(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
        yield createElectronBrowserWindow(file, pubManifestUrl);
    });
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
electron_1.app.on("quit", () => {
    debug("app quit");
    _publicationsServer.stop();
});
//# sourceMappingURL=index.js.map