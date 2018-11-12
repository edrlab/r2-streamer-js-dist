"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var debug_ = require("debug");
var debug = debug_("r2:streamer#http/server-secure");
var debugHttps = debug_("r2:https");
var IS_DEV = (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev");
function serverSecure(server, topRouter) {
    topRouter.use(function (req, res, next) {
        if (!server.isSecured()) {
            next();
            return;
        }
        var doFail = true;
        var serverData = server.serverInfo();
        if (serverData && serverData.trustKey &&
            serverData.trustCheck && serverData.trustCheckIV) {
            var t1 = void 0;
            if (IS_DEV) {
                t1 = process.hrtime();
            }
            var delta = 0;
            var urlCheck = server.serverUrl() + req.url;
            var base64Val = req.get("X-" + serverData.trustCheck);
            if (base64Val) {
                var decodedVal = new Buffer(base64Val, "base64");
                var encrypted = decodedVal;
                var decrypteds = [];
                var decryptStream = crypto.createDecipheriv("aes-256-cbc", serverData.trustKey, serverData.trustCheckIV);
                decryptStream.setAutoPadding(false);
                var buff1 = decryptStream.update(encrypted);
                if (buff1) {
                    decrypteds.push(buff1);
                }
                var buff2 = decryptStream.final();
                if (buff2) {
                    decrypteds.push(buff2);
                }
                var decrypted = Buffer.concat(decrypteds);
                var nPaddingBytes = decrypted[decrypted.length - 1];
                var size = encrypted.length - nPaddingBytes;
                var decryptedStr = decrypted.slice(0, size).toString("utf8");
                try {
                    var decryptedJson = JSON.parse(decryptedStr);
                    var url = decryptedJson.url;
                    var time = decryptedJson.time;
                    var now = Date.now();
                    delta = now - time;
                    if (delta <= 3000) {
                        var i = url.lastIndexOf("#");
                        if (i > 0) {
                            url = url.substr(0, i);
                        }
                        if (url === urlCheck) {
                            doFail = false;
                        }
                    }
                }
                catch (err) {
                    debug(err);
                    debug(decryptedStr);
                }
            }
            if (IS_DEV) {
                var t2 = process.hrtime(t1);
                var seconds = t2[0];
                var nanoseconds = t2[1];
                var milliseconds = nanoseconds / 1e6;
                debugHttps("< B > (" + delta + "ms) " + seconds + "s " + milliseconds + "ms [ " + urlCheck + " ]");
            }
        }
        if (doFail) {
            debug("############## X-Debug- FAIL ========================== ");
            debug(req.url);
            res.status(200);
            res.end();
            return;
        }
        next();
    });
}
exports.serverSecure = serverSecure;
//# sourceMappingURL=server-secure.js.map