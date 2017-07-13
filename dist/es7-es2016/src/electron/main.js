"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const path = require("path");
const UrlUtils_1 = require("../_utils/http/UrlUtils");
const debug_ = require("debug");
const electron_1 = require("electron");
const filehound = require("filehound");
const portfinder = require("portfinder");
const server_1 = require("../http/server");
const init_globals_1 = require("../init-globals");
init_globals_1.initGlobals();
const debug = debug_("r2:electron:main");
let electronBrowserWindow;
function createElectronBrowserWindow() {
    debug("createElectronBrowserWindow()");
    if (electron_1.session.defaultSession) {
        electron_1.session.defaultSession.clearStorageData({
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
        });
    }
    (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const dirPath = fs.realpathSync(path.resolve("./misc/epubs/"));
        const files = yield filehound.create()
            .paths(dirPath)
            .ext([".epub", ".epub3", ".cbz"])
            .find();
        const server = new server_1.Server();
        const pubPaths = server.addPublications(files);
        const port = yield portfinder.getPortPromise();
        const url = server.start(port);
        const pubManifestUrls = pubPaths.map((pubPath) => {
            return `${url}${pubPath}`;
        });
        debug(pubManifestUrls);
        electronBrowserWindow = new electron_1.BrowserWindow({
            height: 600,
            webPreferences: {
                allowRunningInsecureContent: false,
                contextIsolation: false,
                devTools: true,
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                sandbox: false,
                webSecurity: true,
            },
            width: 800,
        });
        const urlEncoded = UrlUtils_1.encodeURIComponent_RFC3986(url);
        electronBrowserWindow.loadURL(`file://${__dirname}/index.html?pub=${urlEncoded}`);
        electronBrowserWindow.webContents.on("dom-ready", () => {
            debug("electronBrowserWindow dom-ready");
            if (electronBrowserWindow) {
                electronBrowserWindow.webContents.openDevTools();
            }
        });
        electronBrowserWindow.on("closed", () => {
            debug("electronBrowserWindow closed");
            electronBrowserWindow = undefined;
            server.stop();
        });
    }))();
}
electron_1.app.on("window-all-closed", () => {
    debug("app window-all-closed");
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("ready", () => {
    debug("app ready");
    createElectronBrowserWindow();
});
electron_1.app.on("activate", () => {
    debug("app activate");
    if (!electronBrowserWindow) {
        createElectronBrowserWindow();
    }
});
//# sourceMappingURL=main.js.map