"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var path = require("path");
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
    debug("Server start, Electron main window ...");
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var dirPath, files, server, pubPaths, port, url, pubManifestUrls;
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
                    electronBrowserWindow = new electron_1.BrowserWindow({ width: 800, height: 600 });
                    electronBrowserWindow.loadURL(url);
                    electronBrowserWindow.webContents.openDevTools();
                    electronBrowserWindow.on("closed", function () {
                        debug("Server stop ...");
                        electronBrowserWindow = undefined;
                        server.stop();
                    });
                    return [2];
            }
        });
    }); })();
}
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("ready", function () {
    createElectronBrowserWindow();
});
electron_1.app.on("activate", function () {
    if (!electronBrowserWindow) {
        createElectronBrowserWindow();
    }
});
//# sourceMappingURL=main.js.map