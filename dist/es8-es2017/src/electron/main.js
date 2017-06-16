"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const debug_ = require("debug");
const electron_1 = require("electron");
const filehound = require("filehound");
const portfinder = require("portfinder");
const server_1 = require("../http/server");
const debug = debug_("r2:electron:main");
let electronBrowserWindow;
function createElectronBrowserWindow() {
    debug("Server start, Electron main window ...");
    (async () => {
        const dirPath = fs.realpathSync(path.resolve("./misc/epubs/"));
        const files = await filehound.create()
            .paths(dirPath)
            .ext([".epub", ".cbz"])
            .find();
        const server = new server_1.Server();
        const pubPaths = server.addPublications(files);
        const port = await portfinder.getPortPromise();
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
    })();
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