"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var path = require("path");
var UrlUtils_1 = require("../../../es8-es2017/src/_utils/http/UrlUtils");
var debug_ = require("debug");
var electron_1 = require("electron");
var filehound = require("filehound");
var portfinder = require("portfinder");
var server_1 = require("../http/server");
var init_globals_1 = require("../init-globals");
init_globals_1.initGlobals();
var debug = debug_("r2:electron:main");
var _publicationsServer;
var _publicationsServerPort;
var _publicationsRootUrl;
var _publicationsFilePaths;
var _publicationsUrls;
var _electronBrowserWindows;
function createElectronBrowserWindow(publicationFilePath, publicationUrl) {
    debug("createElectronBrowserWindow() " + publicationFilePath + " : " + publicationUrl);
    var electronBrowserWindow = new electron_1.BrowserWindow({
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
    electronBrowserWindow.webContents.on("dom-ready", function () {
        debug("electronBrowserWindow dom-ready " + publicationFilePath + " : " + publicationUrl);
        electronBrowserWindow.webContents.openDevTools();
    });
    electronBrowserWindow.on("closed", function () {
        debug("electronBrowserWindow closed " + publicationFilePath + " : " + publicationUrl);
        var i = _electronBrowserWindows.indexOf(electronBrowserWindow);
        if (i < 0) {
            console.log("electronBrowserWindow NOT FOUND?!");
            return;
        }
        _electronBrowserWindows.splice(i, 1);
    });
    var urlEncoded = UrlUtils_1.encodeURIComponent_RFC3986(publicationUrl);
    var fullUrl = "file://" + __dirname + "/renderer/index.html?pub=" + urlEncoded;
    debug(fullUrl);
    electronBrowserWindow.webContents.loadURL(fullUrl);
}
electron_1.app.on("window-all-closed", function () {
    debug("app window-all-closed");
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("ready", function () {
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
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var dirPath, pubPaths, menuTemplate, menu;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirPath = fs.realpathSync(path.resolve("./misc/epubs/"));
                    return [4, filehound.create()
                            .paths(dirPath)
                            .ext([".epub", ".epub3", ".cbz"])
                            .find()];
                case 1:
                    _publicationsFilePaths = _a.sent();
                    debug(_publicationsFilePaths);
                    _publicationsServer = new server_1.Server();
                    pubPaths = _publicationsServer.addPublications(_publicationsFilePaths);
                    return [4, portfinder.getPortPromise()];
                case 2:
                    _publicationsServerPort = _a.sent();
                    _publicationsRootUrl = _publicationsServer.start(_publicationsServerPort);
                    _publicationsUrls = pubPaths.map(function (pubPath) {
                        return "" + _publicationsRootUrl + pubPath;
                    });
                    debug(_publicationsUrls);
                    menuTemplate = [
                        {
                            label: "Electron R2",
                            submenu: [
                                {
                                    accelerator: "Command+Q",
                                    click: function () { electron_1.app.quit(); },
                                    label: "Quit",
                                },
                            ],
                        },
                    ];
                    _publicationsUrls.forEach(function (pubManifestUrl, n) {
                        var file = _publicationsFilePaths[n];
                        console.log("MENU ITEM: " + file + " : " + pubManifestUrl);
                        menuTemplate[0].submenu.push({
                            click: function () {
                                createElectronBrowserWindow(file, pubManifestUrl);
                            },
                            label: file,
                        });
                    });
                    menu = electron_1.Menu.buildFromTemplate(menuTemplate);
                    electron_1.Menu.setApplicationMenu(menu);
                    return [2];
            }
        });
    }); })();
});
electron_1.app.on("activate", function () {
    debug("app activate");
});
electron_1.app.on("quit", function () {
    debug("app quit");
    _publicationsServer.stop();
});
//# sourceMappingURL=main.js.map