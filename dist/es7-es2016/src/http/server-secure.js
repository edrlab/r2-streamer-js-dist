"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverSecure = exports.serverSecureHTTPHeader = void 0;
const crypto = require("crypto");
const debug_ = require("debug");
const debug = debug_("r2:streamer#http/server-secure");
const debugHttps = debug_("r2:https");
const IS_DEV = (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "dev");
function serverSecureHTTPHeader(server, url) {
    const info = server.serverInfo();
    if (server.isSecured() &&
        info && info.trustKey && info.trustCheck && info.trustCheckIV) {
        let t1;
        if (IS_DEV) {
            t1 = process.hrtime();
        }
        const encrypteds = [];
        const encryptStream = crypto.createCipheriv("aes-256-cbc", info.trustKey, info.trustCheckIV);
        encryptStream.setAutoPadding(true);
        const now = Date.now();
        const jsonStr = `{"url":"${url}","time":${now}}`;
        const buff1 = encryptStream.update(jsonStr, "utf8");
        if (buff1) {
            encrypteds.push(buff1);
        }
        const buff2 = encryptStream.final();
        if (buff2) {
            encrypteds.push(buff2);
        }
        const encrypted = Buffer.concat(encrypteds);
        const base64 = Buffer.from(encrypted).toString("base64");
        if (IS_DEV) {
            const t2 = process.hrtime(t1);
            const seconds = t2[0];
            const nanoseconds = t2[1];
            const milliseconds = nanoseconds / 1e6;
            debugHttps(`< A > ${seconds}s ${milliseconds}ms [ ${url} ]`);
        }
        return { name: "X-" + info.trustCheck, value: base64 };
    }
    return undefined;
}
exports.serverSecureHTTPHeader = serverSecureHTTPHeader;
function serverSecure(server, topRouter) {
    topRouter.use((req, res, next) => {
        if (!server.isSecured()) {
            next();
            return;
        }
        if (req.method.toLowerCase() === "options") {
            next();
            return;
        }
        let doFail = true;
        const serverData = server.serverInfo();
        if (serverData && serverData.trustKey &&
            serverData.trustCheck && serverData.trustCheckIV) {
            let t1;
            if (IS_DEV) {
                t1 = process.hrtime();
            }
            let delta = 0;
            const urlCheck = server.serverUrl() + req.url;
            const base64Val = req.get("X-" + serverData.trustCheck);
            if (base64Val) {
                const decodedVal = Buffer.from(base64Val, "base64");
                const encrypted = decodedVal;
                const decrypteds = [];
                const decryptStream = crypto.createDecipheriv("aes-256-cbc", serverData.trustKey, serverData.trustCheckIV);
                decryptStream.setAutoPadding(false);
                const buff1 = decryptStream.update(encrypted);
                if (buff1) {
                    decrypteds.push(buff1);
                }
                const buff2 = decryptStream.final();
                if (buff2) {
                    decrypteds.push(buff2);
                }
                const decrypted = Buffer.concat(decrypteds);
                const nPaddingBytes = decrypted[decrypted.length - 1];
                const size = encrypted.length - nPaddingBytes;
                const decryptedStr = decrypted.slice(0, size).toString("utf8");
                try {
                    const decryptedJson = JSON.parse(decryptedStr);
                    let url = decryptedJson.url;
                    const time = decryptedJson.time;
                    const now = Date.now();
                    delta = now - time;
                    if (delta <= 3000) {
                        const i = url.lastIndexOf("#");
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
                const t2 = process.hrtime(t1);
                const seconds = t2[0];
                const nanoseconds = t2[1];
                const milliseconds = nanoseconds / 1e6;
                debugHttps(`< B > (${delta}ms) ${seconds}s ${milliseconds}ms [ ${urlCheck} ]`);
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