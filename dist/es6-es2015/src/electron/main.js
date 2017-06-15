"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const debug_ = require("debug");
const electron_1 = require("electron");
const filehound = require("filehound");
const portfinder = require("portfinder");
const Server_1 = require("../http/Server");
const debug = debug_("r2:electron:main");
let electronBrowserWindow;
function createElectronBrowserWindow() {
    debug("Server start, Electron main window ...");
    (() => __awaiter(this, void 0, void 0, function* () {
        const dirPath = fs.realpathSync(path.resolve("./misc/epubs/"));
        const files = yield filehound.create()
            .paths(dirPath)
            .ext([".epub", ".cbz"])
            .find();
        const server = new Server_1.Server();
        const pubPaths = server.addPublications(files);
        const port = yield portfinder.getPortPromise();
        const url = server.start(port);
        const pubManifestUrls = pubPaths.map((pubPath) => {
            return `${url}${pubPath}`;
        });
        debug(pubManifestUrls);
        electronBrowserWindow = new electron_1.BrowserWindow({ width: 800, height: 600 });
        electronBrowserWindow.loadURL(url);
        electronBrowserWindow.webContents.openDevTools();
        electronBrowserWindow.on("closed", () => {
            debug("Server stop ...");
            electronBrowserWindow = undefined;
            server.stop();
        });
    }))();
}
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("ready", () => {
    createElectronBrowserWindow();
});
electron_1.app.on("activate", () => {
    if (!electronBrowserWindow) {
        createElectronBrowserWindow();
    }
});
//# sourceMappingURL=main.js.map