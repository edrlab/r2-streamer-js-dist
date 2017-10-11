"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var express = require("express");
var fs = require("fs");
var path = require("path");
var UrlUtils_1 = require("../../../es8-es2017/src/_utils/http/UrlUtils");
var debug_ = require("debug");
var electron_1 = require("electron");
var filehound = require("filehound");
var portfinder = require("portfinder");
var server_1 = require("../http/server");
var init_globals_1 = require("../init-globals");
var events_1 = require("./common/events");
var sessions_1 = require("./common/sessions");
init_globals_1.initGlobals();
var debug = debug_("r2:electron:main");
var _publicationsServer;
var _publicationsServerPort;
var _publicationsRootUrl;
var _publicationsFilePaths;
var _publicationsUrls;
var _electronBrowserWindows;
var defaultBookPath = fs.realpathSync(path.resolve("./misc/epubs/"));
var lastBookPath;
electron_1.app.on("web-contents-created", function (_evt, wc) {
    if (!_electronBrowserWindows || !_electronBrowserWindows.length) {
        return;
    }
    _electronBrowserWindows.forEach(function (win) {
        if (wc.hostWebContents &&
            wc.hostWebContents.id === win.webContents.id) {
            debug("WEBVIEW web-contents-created");
            wc.on("will-navigate", function (event, url) {
                debug("webview.getWebContents().on('will-navigate'");
                debug(url);
                var wcUrl = event.sender.getURL();
                debug(wcUrl);
                event.preventDefault();
                win.webContents.send(events_1.R2_EVENT_LINK, url);
            });
        }
    });
});
function openAllDevTools() {
    for (var _i = 0, _a = electron_1.webContents.getAllWebContents(); _i < _a.length; _i++) {
        var wc = _a[_i];
        wc.openDevTools();
    }
}
electron_1.ipcMain.on(events_1.R2_EVENT_DEVTOOLS, function (_event, _arg) {
    openAllDevTools();
});
electron_1.ipcMain.on(events_1.R2_EVENT_TRY_LCP_PASS, function (event, publicationFilePath, lcpPass) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var okay, err_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                debug(publicationFilePath);
                debug(lcpPass);
                okay = false;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, tryLcpPass(publicationFilePath, lcpPass)];
            case 2:
                okay = _a.sent();
                return [3, 4];
            case 3:
                err_1 = _a.sent();
                debug(err_1);
                okay = false;
                return [3, 4];
            case 4:
                event.sender.send(events_1.R2_EVENT_TRY_LCP_PASS_RES, okay, (okay ? "LCP okay. (" + lcpPass + ")" : "LCP problem!? (" + lcpPass + ")"));
                return [2];
        }
    });
}); });
function tryLcpPass(publicationFilePath, lcpPass) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var publication, checkSum, lcpPassHex, okay;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    publication = _publicationsServer.cachedPublication(publicationFilePath);
                    if (!publication) {
                        return [2, false];
                    }
                    checkSum = crypto.createHash("sha256");
                    checkSum.update(lcpPass);
                    lcpPassHex = checkSum.digest("hex");
                    return [4, publication.LCP.setUserPassphrase(lcpPassHex)];
                case 1:
                    okay = _a.sent();
                    if (!okay) {
                        debug("FAIL publication.LCP.setUserPassphrase()");
                    }
                    return [2, okay];
            }
        });
    });
}
function createElectronBrowserWindow(publicationFilePath, publicationUrl) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var publication, err_2, lcpHint, electronBrowserWindow, urlEncoded, fullUrl;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    debug("createElectronBrowserWindow() " + publicationFilePath + " : " + publicationUrl);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, _publicationsServer.loadOrGetCachedPublication(publicationFilePath)];
                case 2:
                    publication = _a.sent();
                    return [3, 4];
                case 3:
                    err_2 = _a.sent();
                    debug(err_2);
                    return [3, 4];
                case 4:
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
                    electronBrowserWindow = new electron_1.BrowserWindow({
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
                    electronBrowserWindow.webContents.on("dom-ready", function () {
                        debug("electronBrowserWindow dom-ready " + publicationFilePath + " : " + publicationUrl);
                    });
                    electronBrowserWindow.on("closed", function () {
                        debug("electronBrowserWindow closed " + publicationFilePath + " : " + publicationUrl);
                        var i = _electronBrowserWindows.indexOf(electronBrowserWindow);
                        if (i < 0) {
                            debug("electronBrowserWindow NOT FOUND?!");
                            return;
                        }
                        _electronBrowserWindows.splice(i, 1);
                    });
                    urlEncoded = UrlUtils_1.encodeURIComponent_RFC3986(publicationUrl);
                    fullUrl = "file://" + __dirname + "/renderer/index.html?pub=" + urlEncoded;
                    if (lcpHint) {
                        fullUrl = fullUrl + "&lcpHint=" + lcpHint;
                    }
                    debug(fullUrl);
                    electronBrowserWindow.webContents.loadURL(fullUrl, { extraHeaders: "pragma: no-cache\n" });
                    return [2];
            }
        });
    });
}
electron_1.app.on("ready", function () {
    debug("app ready");
    clearSessions(undefined, undefined);
    var sess = getWebViewSession();
    if (sess) {
        sess.setPermissionRequestHandler(function (wc, permission, callback) {
            console.log("setPermissionRequestHandler");
            console.log(wc.getURL());
            console.log(permission);
            callback(true);
        });
    }
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var staticOptions, pubPaths;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, filehound.create()
                        .paths(defaultBookPath)
                        .ext([".epub", ".epub3", ".cbz"])
                        .find()];
                case 1:
                    _publicationsFilePaths = _a.sent();
                    debug(_publicationsFilePaths);
                    _publicationsServer = new server_1.Server({
                        disableDecryption: false,
                        disableReaders: false,
                    });
                    staticOptions = {
                        etag: false,
                    };
                    _publicationsServer.expressUse("/readium-css", express.static("misc/ReadiumCSS", staticOptions));
                    pubPaths = _publicationsServer.addPublications(_publicationsFilePaths);
                    return [4, portfinder.getPortPromise()];
                case 2:
                    _publicationsServerPort = _a.sent();
                    _publicationsRootUrl = _publicationsServer.start(_publicationsServerPort);
                    _publicationsUrls = pubPaths.map(function (pubPath) {
                        return "" + _publicationsRootUrl + pubPath;
                    });
                    debug(_publicationsUrls);
                    resetMenu();
                    process.nextTick(function () {
                        var detail = "Note that this is only a developer application (" +
                            "test framework) for the Readium2 NodeJS 'streamer' and Electron-based 'navigator'.";
                        var message = "Use the 'Electron' menu to load publications.";
                        if (process.platform === "darwin") {
                            var choice = electron_1.dialog.showMessageBox({
                                buttons: ["&OK"],
                                cancelId: 0,
                                defaultId: 0,
                                detail: detail,
                                message: message,
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
                            var html = "<html><h2>" + message + "<hr>" + detail + "</h2></html>";
                            var electronBrowserWindow = new electron_1.BrowserWindow({
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
                    return [2];
            }
        });
    }); })();
});
function resetMenu() {
    var _this = this;
    var menuTemplate = [
        {
            label: "Readium2 Electron",
            submenu: [
                {
                    accelerator: "Command+Q",
                    click: function () { electron_1.app.quit(); },
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
                    click: function () {
                        openAllDevTools();
                    },
                    label: "Open Dev Tools",
                },
            ],
        },
    ];
    menuTemplate[1].submenu.push({
        click: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var choice, n, publicationPaths, file, pubManifestUrl;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        choice = electron_1.dialog.showOpenDialog({
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
                            return [2];
                        }
                        debug(choice[0]);
                        lastBookPath = path.dirname(choice[0]);
                        debug(lastBookPath);
                        n = _publicationsFilePaths.indexOf(choice[0]);
                        if (n < 0) {
                            publicationPaths = _publicationsServer.addPublications(choice);
                            debug(publicationPaths);
                            _publicationsFilePaths.push(choice[0]);
                            debug(_publicationsFilePaths);
                            _publicationsUrls.push("" + _publicationsRootUrl + publicationPaths[0]);
                            debug(_publicationsUrls);
                            n = _publicationsFilePaths.length - 1;
                            process.nextTick(function () {
                                resetMenu();
                            });
                        }
                        file = _publicationsFilePaths[n];
                        pubManifestUrl = _publicationsUrls[n];
                        return [4, createElectronBrowserWindow(file, pubManifestUrl)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); },
        label: "Load file...",
    });
    _publicationsUrls.forEach(function (pubManifestUrl, n) {
        var file = _publicationsFilePaths[n];
        debug("MENU ITEM: " + file + " : " + pubManifestUrl);
        menuTemplate[1].submenu.push({
            click: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4, createElectronBrowserWindow(file, pubManifestUrl)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); },
            label: file,
        });
    });
    var menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);
}
electron_1.app.on("activate", function () {
    debug("app activate");
});
electron_1.app.on("before-quit", function () {
    debug("app before quit");
});
electron_1.app.on("window-all-closed", function () {
    debug("app window-all-closed");
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
function willQuitCallback(evt) {
    debug("app will quit");
    electron_1.app.removeListener("will-quit", willQuitCallback);
    _publicationsServer.stop();
    var done = false;
    setTimeout(function () {
        if (done) {
            return;
        }
        done = true;
        debug("Cache and StorageData clearance waited enough => force quitting...");
        electron_1.app.quit();
    }, 6000);
    var sessionCleared = 0;
    var callback = function () {
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
electron_1.app.on("quit", function () {
    debug("app quit");
});
function clearSession(sess, str, callbackCache, callbackStorageData) {
    sess.clearCache(function () {
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
    }, function () {
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
    var sess = getWebViewSession();
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
    var done = false;
    setTimeout(function () {
        if (done) {
            return;
        }
        done = true;
        debug("Cache and StorageData clearance waited enough (default session) => force webview session...");
        clearWebviewSession(callbackCache, callbackStorageData);
    }, 6000);
    var sessionCleared = 0;
    var callback = function () {
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