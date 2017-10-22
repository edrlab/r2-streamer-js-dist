"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var path = require("path");
var UrlUtils_1 = require("../../_utils/http/UrlUtils");
var zipInjector_1 = require("../../_utils/zip/zipInjector");
var server_1 = require("../../http/server");
var init_globals_1 = require("../../init-globals");
var lcp_1 = require("../../parser/epub/lcp");
var debug_ = require("debug");
var electron_1 = require("electron");
var filehound = require("filehound");
var portfinder = require("portfinder");
var request = require("request");
var requestPromise = require("request-promise-native");
var ta_json_1 = require("ta-json");
var events_1 = require("../common/events");
var sessions_1 = require("../common/sessions");
var browser_window_tracker_1 = require("./browser-window-tracker");
var lcp_2 = require("./lcp");
var lsd_1 = require("./lsd");
var readium_css_1 = require("./readium-css");
init_globals_1.initGlobals();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP/lcp.node"));
var debug = debug_("r2:electron:main");
var _publicationsServer;
var _publicationsServerPort;
var _publicationsRootUrl;
var _publicationsFilePaths;
var _publicationsUrls;
var DEFAULT_BOOK_PATH = fs.realpathSync(path.resolve("./misc/epubs/"));
var _lastBookPath;
function openAllDevTools() {
    for (var _i = 0, _a = electron_1.webContents.getAllWebContents(); _i < _a.length; _i++) {
        var wc = _a[_i];
        wc.openDevTools();
    }
}
electron_1.ipcMain.on(events_1.R2_EVENT_DEVTOOLS, function (_event, _arg) {
    openAllDevTools();
});
function createElectronBrowserWindow(publicationFilePath, publicationUrl) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var publication, err_1, lcpHint, err_2, electronBrowserWindow, urlEncoded, fullUrl;
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
                    err_1 = _a.sent();
                    debug(err_1);
                    return [3, 4];
                case 4:
                    if (!publication) {
                        return [2];
                    }
                    if (!(publication && publication.LCP)) return [3, 9];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4, lsd_1.launchStatusDocumentProcessing(publication, publicationFilePath, lsd_1.deviceIDManager, function () {
                            debug("launchStatusDocumentProcessing DONE.");
                        })];
                case 6:
                    _a.sent();
                    return [3, 8];
                case 7:
                    err_2 = _a.sent();
                    debug(err_2);
                    return [3, 8];
                case 8:
                    if (publication.LCP.Encryption &&
                        publication.LCP.Encryption.UserKey &&
                        publication.LCP.Encryption.UserKey.TextHint) {
                        lcpHint = publication.LCP.Encryption.UserKey.TextHint;
                    }
                    if (!lcpHint) {
                        lcpHint = "LCP passphrase";
                    }
                    _a.label = 9;
                case 9:
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
                    browser_window_tracker_1.trackBrowserWindow(electronBrowserWindow);
                    electronBrowserWindow.webContents.on("dom-ready", function () {
                        debug("electronBrowserWindow dom-ready " + publicationFilePath + " : " + publicationUrl);
                    });
                    urlEncoded = UrlUtils_1.encodeURIComponent_RFC3986(publicationUrl);
                    fullUrl = "file://" + __dirname + "/../renderer/index.html?pub=" + urlEncoded;
                    if (lcpHint) {
                        fullUrl = fullUrl + "&lcpHint=" + UrlUtils_1.encodeURIComponent_RFC3986(lcpHint);
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
            debug("setPermissionRequestHandler");
            debug(wc.getURL());
            debug(permission);
            callback(true);
        });
    }
    (function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var pubPaths;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, filehound.create()
                        .paths(DEFAULT_BOOK_PATH)
                        .ext([".epub", ".epub3", ".cbz", ".lcpl"])
                        .find()];
                case 1:
                    _publicationsFilePaths = _a.sent();
                    debug(_publicationsFilePaths);
                    _publicationsServer = new server_1.Server({
                        disableDecryption: false,
                        disableReaders: false,
                    });
                    lcp_2.installLcpHandler(_publicationsServer);
                    readium_css_1.setupReadiumCSS(_publicationsServer, "dist/ReadiumCSS");
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
                    process.nextTick(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var args, filePathToLoadOnLaunch, argPath, filePath, detail, message, choice, html, electronBrowserWindow;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    args = process.argv.slice(2);
                                    console.log("args:");
                                    console.log(args);
                                    if (args && args.length && args[0]) {
                                        argPath = args[0].trim();
                                        filePath = argPath;
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
                                    if (!filePathToLoadOnLaunch) return [3, 2];
                                    return [4, openFileDownload(filePathToLoadOnLaunch)];
                                case 1:
                                    _a.sent();
                                    return [2];
                                case 2:
                                    detail = "Note that this is only a developer application (" +
                                        "test framework) for the Readium2 NodeJS 'streamer' and Electron-based 'navigator'.";
                                    message = "Use the 'Electron' menu to load publications.";
                                    if (process.platform === "darwin") {
                                        choice = electron_1.dialog.showMessageBox({
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
                                        html = "<html><h2>" + message + "<hr>" + detail + "</h2></html>";
                                        electronBrowserWindow = new electron_1.BrowserWindow({
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
                                    return [2];
                            }
                        });
                    }); });
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
            var choice, filePath;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        choice = electron_1.dialog.showOpenDialog({
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
                            return [2];
                        }
                        filePath = choice[0];
                        debug(filePath);
                        return [4, openFileDownload(filePath)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        }); },
        label: "Load file...",
    });
    _publicationsUrls.forEach(function (pubManifestUrl, n) {
        var filePath = _publicationsFilePaths[n];
        debug("MENU ITEM: " + filePath + " : " + pubManifestUrl);
        menuTemplate[1].submenu.push({
            click: function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            debug(filePath);
                            return [4, openFileDownload(filePath)];
                        case 1:
                            _a.sent();
                            return [2];
                    }
                });
            }); },
            label: filePath,
        });
    });
    var menu = electron_1.Menu.buildFromTemplate(menuTemplate);
    electron_1.Menu.setApplicationMenu(menu);
}
function openFileDownload(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _this = this;
        var dir, ext, filename, destFileName, lcplStr, lcplJson, lcpl, pubLink_1, destPathTMP_1, destPathFINAL_1, failure_1, success, needsStreamingResponse, response, err_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = path.dirname(filePath);
                    _lastBookPath = dir;
                    debug(_lastBookPath);
                    ext = path.extname(filePath);
                    filename = path.basename(filePath);
                    destFileName = filename + ".epub";
                    if (!(ext === ".lcpl")) return [3, 8];
                    lcplStr = fs.readFileSync(filePath, { encoding: "utf8" });
                    lcplJson = global.JSON.parse(lcplStr);
                    lcpl = ta_json_1.JSON.deserialize(lcplJson, lcp_1.LCP);
                    if (!lcpl.Links) return [3, 7];
                    pubLink_1 = lcpl.Links.find(function (link) {
                        return link.Rel === "publication";
                    });
                    if (!pubLink_1) return [3, 7];
                    destPathTMP_1 = path.join(dir, destFileName + ".tmp");
                    destPathFINAL_1 = path.join(dir, destFileName);
                    failure_1 = function (err) {
                        debug(err);
                        process.nextTick(function () {
                            var detail = (typeof err === "string") ?
                                err :
                                (err.toString ? err.toString() : "ERROR!?");
                            var message = "LCP EPUB download fail! [" + pubLink_1.Href + "]";
                            var res = electron_1.dialog.showMessageBox({
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
                            if (res === 0) {
                                debug("ok");
                            }
                        });
                    };
                    success = function (response) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        var destStreamTMP;
                        return tslib_1.__generator(this, function (_a) {
                            if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                                failure_1("HTTP CODE " + response.statusCode);
                                return [2];
                            }
                            destStreamTMP = fs.createWriteStream(destPathTMP_1);
                            response.pipe(destStreamTMP);
                            destStreamTMP.on("finish", function () {
                                var zipError = function (err) {
                                    debug(err);
                                    process.nextTick(function () {
                                        var detail = (typeof err === "string") ?
                                            err :
                                            (err.toString ? err.toString() : "ERROR!?");
                                        var message = "LCP EPUB zip error! [" + destPathTMP_1 + "]";
                                        var res = electron_1.dialog.showMessageBox({
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
                                        if (res === 0) {
                                            debug("ok");
                                        }
                                    });
                                };
                                var doneCallback = function () {
                                    setTimeout(function () {
                                        fs.unlinkSync(destPathTMP_1);
                                    }, 1000);
                                    process.nextTick(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                        var detail, message, res;
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    detail = destPathFINAL_1 + " ---- [" + pubLink_1.Href + "]";
                                                    message = "LCP EPUB file download success [" + destFileName + "]";
                                                    res = electron_1.dialog.showMessageBox({
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
                                                    if (res === 0) {
                                                        debug("ok");
                                                    }
                                                    return [4, openFile(destPathFINAL_1)];
                                                case 1:
                                                    _a.sent();
                                                    return [2];
                                            }
                                        });
                                    }); });
                                };
                                var zipEntryPath = "META-INF/license.lcpl";
                                zipInjector_1.injectFileInZip(destPathTMP_1, destPathFINAL_1, filePath, zipEntryPath, zipError, doneCallback);
                            });
                            return [2];
                        });
                    }); };
                    needsStreamingResponse = true;
                    if (!needsStreamingResponse) return [3, 1];
                    request.get({
                        headers: {},
                        method: "GET",
                        uri: pubLink_1.Href,
                    })
                        .on("response", success)
                        .on("error", failure_1);
                    return [3, 7];
                case 1:
                    response = void 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4, requestPromise({
                            headers: {},
                            method: "GET",
                            resolveWithFullResponse: true,
                            uri: pubLink_1.Href,
                        })];
                case 3:
                    response = _a.sent();
                    return [3, 5];
                case 4:
                    err_3 = _a.sent();
                    failure_1(err_3);
                    return [2];
                case 5:
                    response = response;
                    return [4, success(response)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [3, 10];
                case 8: return [4, openFile(filePath)];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [2];
            }
        });
    });
}
function openFile(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var n, publicationPaths, file, pubManifestUrl;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    n = _publicationsFilePaths.indexOf(filePath);
                    if (n < 0) {
                        publicationPaths = _publicationsServer.addPublications([filePath]);
                        debug(publicationPaths);
                        _publicationsFilePaths.push(filePath);
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
    });
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
    return electron_1.session.fromPartition(sessions_1.R2_SESSION_WEBVIEW, { cache: true });
}
function clearWebviewSession(callbackCache, callbackStorageData) {
    var sess = getWebViewSession();
    if (sess) {
        clearSession(sess, "[" + sessions_1.R2_SESSION_WEBVIEW + "]", callbackCache, callbackStorageData);
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
//# sourceMappingURL=index.js.map