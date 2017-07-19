"use strict";
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
var electronBrowserWindow;
function createElectronBrowserWindow() {
    var _this = this;
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
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var dirPath, files, server, pubPaths, port, url, pubManifestUrls, urlEncoded;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirPath = fs.realpathSync(path.resolve("./misc/epubs/"));
                    return [4, filehound.create()
                            .paths(dirPath)
                            .ext([".epub", ".epub3", ".cbz"])
                            .find()];
                case 1:
                    files = _a.sent();
                    server = new server_1.Server();
                    pubPaths = server.addPublications(files);
                    return [4, portfinder.getPortPromise()];
                case 2:
                    port = _a.sent();
                    url = server.start(port);
                    pubManifestUrls = pubPaths.map(function (pubPath) {
                        return "" + url + pubPath;
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
                    urlEncoded = UrlUtils_1.encodeURIComponent_RFC3986(url);
                    electronBrowserWindow.loadURL("file://" + __dirname + "/index.html?pub=" + urlEncoded);
                    electronBrowserWindow.webContents.on("dom-ready", function () {
                        debug("electronBrowserWindow dom-ready");
                        if (electronBrowserWindow) {
                            electronBrowserWindow.webContents.openDevTools();
                        }
                    });
                    electronBrowserWindow.on("closed", function () {
                        debug("electronBrowserWindow closed");
                        electronBrowserWindow = undefined;
                        server.stop();
                    });
                    return [2];
            }
        });
    }); })();
}
electron_1.app.on("window-all-closed", function () {
    debug("app window-all-closed");
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("ready", function () {
    debug("app ready");
    createElectronBrowserWindow();
});
electron_1.app.on("activate", function () {
    debug("app activate");
    if (!electronBrowserWindow) {
        createElectronBrowserWindow();
    }
});
//# sourceMappingURL=main.js.map