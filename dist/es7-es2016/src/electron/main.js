"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const path = require("path");
const UrlUtils_1 = require("../../../es8-es2017/src/_utils/http/UrlUtils");
const debug_ = require("debug");
const electron_1 = require("electron");
const filehound = require("filehound");
const portfinder = require("portfinder");
const server_1 = require("../http/server");
const init_globals_1 = require("../init-globals");
init_globals_1.initGlobals();
const debug = debug_("r2:electron:main");
let _publicationsServer;
let _publicationsServerPort;
let _publicationsRootUrl;
let _publicationsFilePaths;
let _publicationsUrls;
let _electronBrowserWindows;
function createElectronBrowserWindow(publicationFilePath, publicationUrl) {
    debug("createElectronBrowserWindow() " + publicationFilePath + " : " + publicationUrl);
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
        },
        width: 800,
    });
    if (!_electronBrowserWindows) {
        _electronBrowserWindows = [];
    }
    _electronBrowserWindows.push(electronBrowserWindow);
    electronBrowserWindow.webContents.on("dom-ready", () => {
        debug("electronBrowserWindow dom-ready " + publicationFilePath + " : " + publicationUrl);
        electronBrowserWindow.webContents.openDevTools();
    });
    electronBrowserWindow.on("closed", () => {
        debug("electronBrowserWindow closed " + publicationFilePath + " : " + publicationUrl);
        const i = _electronBrowserWindows.indexOf(electronBrowserWindow);
        if (i < 0) {
            console.log("electronBrowserWindow NOT FOUND?!");
            return;
        }
        _electronBrowserWindows.splice(i, 1);
    });
    const urlEncoded = UrlUtils_1.encodeURIComponent_RFC3986(publicationUrl);
    const fullUrl = `file://${process.cwd()}/src/electron/renderer/index.html?pub=${urlEncoded}`;
    debug(fullUrl);
    electronBrowserWindow.webContents.loadURL(fullUrl);
}
electron_1.app.on("window-all-closed", () => {
    debug("app window-all-closed");
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("ready", () => {
    debug("app ready");
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
        _publicationsFilePaths = yield filehound.create()
            .paths(dirPath)
            .ext([".epub", ".epub3", ".cbz"])
            .find();
        debug(_publicationsFilePaths);
        _publicationsServer = new server_1.Server();
        const pubPaths = _publicationsServer.addPublications(_publicationsFilePaths);
        _publicationsServerPort = yield portfinder.getPortPromise();
        _publicationsRootUrl = _publicationsServer.start(_publicationsServerPort);
        _publicationsUrls = pubPaths.map((pubPath) => {
            return `${_publicationsRootUrl}${pubPath}`;
        });
        debug(_publicationsUrls);
        const menuTemplate = [
            {
                label: "Electron R2",
                submenu: [
                    {
                        accelerator: "Command+Q",
                        click: () => { electron_1.app.quit(); },
                        label: "Quit",
                    },
                ],
            },
        ];
        _publicationsUrls.forEach((pubManifestUrl, n) => {
            const file = _publicationsFilePaths[n];
            console.log("MENU ITEM: " + file + " : " + pubManifestUrl);
            menuTemplate[0].submenu.push({
                click: () => {
                    createElectronBrowserWindow(file, pubManifestUrl);
                },
                label: file,
            });
        });
        const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
        electron_1.Menu.setApplicationMenu(menu);
    }))();
});
electron_1.app.on("activate", () => {
    debug("app activate");
});
electron_1.app.on("quit", () => {
    debug("app quit");
    _publicationsServer.stop();
});
//# sourceMappingURL=main.js.map