"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const express = require("express");
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
let _publicationsServer;
let _publicationsServerPort;
let _publicationsRootUrl;
let _publicationsFilePaths;
let _publicationsUrls;
let _electronBrowserWindows;
const defaultBookPath = fs.realpathSync(path.resolve("./misc/epubs/"));
let lastBookPath;
electron_1.ipcMain.on("devtools", (_event, _arg) => {
    for (const wc of electron_1.webContents.getAllWebContents()) {
        wc.openDevTools();
    }
});
electron_1.ipcMain.on("tryLcpPass", (event, publicationFilePath, lcpPass) => {
    debug(publicationFilePath);
    debug(lcpPass);
    const okay = tryLcpPass(publicationFilePath, lcpPass);
    if (!okay) {
        event.sender.send("tryLcpPass", false, "LCP problem! (" + lcpPass + ")");
    }
    else {
        event.sender.send("tryLcpPass", true, "LCP okay. (" + lcpPass + ")");
    }
});
function tryLcpPass(publicationFilePath, lcpPass) {
    const publication = _publicationsServer.cachedPublication(publicationFilePath);
    if (!publication) {
        return false;
    }
    const checkSum = crypto.createHash("sha256");
    checkSum.update(lcpPass);
    const lcpPassHex = checkSum.digest("hex");
    const okay = publication.LCP.setUserPassphrase(lcpPassHex);
    if (!okay) {
        debug("FAIL publication.LCP.setUserPassphrase()");
    }
    return okay;
}
async function createElectronBrowserWindow(publicationFilePath, publicationUrl) {
    debug("createElectronBrowserWindow() " + publicationFilePath + " : " + publicationUrl);
    let publication;
    try {
        publication = await _publicationsServer.loadOrGetCachedPublication(publicationFilePath);
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
}
electron_1.app.on("window-all-closed", () => {
    debug("app window-all-closed");
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
function clearSession(sess, str) {
    sess.clearCache(() => {
        debug("ELECTRON CACHE CLEARED - " + str);
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
        debug("ELECTRON STORAGE CLEARED - " + str);
    });
}
electron_1.app.on("ready", () => {
    debug("app ready");
    if (electron_1.session.defaultSession) {
        clearSession(electron_1.session.defaultSession, "DEFAULT SESSION");
    }
    const sess = electron_1.session.fromPartition("persist:publicationwebview", { cache: false });
    if (sess) {
        clearSession(sess, "SESSION [persist:publicationwebview]");
    }
    sess.setPermissionRequestHandler((wc, permission, callback) => {
        console.log("setPermissionRequestHandler");
        console.log(wc.getURL());
        console.log(permission);
        callback(true);
    });
    (async () => {
        _publicationsFilePaths = await filehound.create()
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
        _publicationsServerPort = await portfinder.getPortPromise();
        _publicationsRootUrl = _publicationsServer.start(_publicationsServerPort);
        _publicationsUrls = pubPaths.map((pubPath) => {
            return `${_publicationsRootUrl}${pubPath}`;
        });
        debug(_publicationsUrls);
        resetMenu();
        process.nextTick(() => {
            const choice = electron_1.dialog.showMessageBox({
                buttons: ["&OK"],
                cancelId: 0,
                defaultId: 0,
                detail: "Note that this is only a developer application (" +
                    "test framework) for the Readium2 NodeJS 'streamer' and Electron-based 'navigator'.",
                message: "Use the 'Electron' menu to load publications.",
                noLink: true,
                normalizeAccessKeys: true,
                title: "Readium2 Electron streamer / navigator",
                type: "info",
            });
            if (choice === 0) {
                debug("ok");
            }
        });
    })();
});
function resetMenu() {
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
    menuTemplate[0].submenu.push({
        click: async () => {
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
            await createElectronBrowserWindow(file, pubManifestUrl);
        },
        label: "Open file...",
    });
    _publicationsUrls.forEach((pubManifestUrl, n) => {
        const file = _publicationsFilePaths[n];
        debug("MENU ITEM: " + file + " : " + pubManifestUrl);
        menuTemplate[0].submenu.push({
            click: async () => {
                await createElectronBrowserWindow(file, pubManifestUrl);
            },
            label: file,
        });
    });
    const menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);
}
electron_1.app.on("activate", () => {
    debug("app activate");
});
electron_1.app.on("quit", () => {
    debug("app quit");
    _publicationsServer.stop();
});
//# sourceMappingURL=main.js.map