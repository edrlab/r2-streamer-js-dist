"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const BufferUtils_1 = require("../../../es8-es2017/src/_utils/stream/BufferUtils");
const zipInjector_1 = require("../../../es8-es2017/src/_utils/zip/zipInjector");
const lcp_1 = require("../../../es8-es2017/src/parser/epub/lcp");
const debug_ = require("debug");
const moment = require("moment");
const request = require("request");
const requestPromise = require("request-promise-native");
const ta_json_1 = require("ta-json");
const debug = debug_("r2:lsd");
function launchStatusDocumentProcessing(publication, publicationPath, _deviceIDManager, onStatusDocumentProcessingComplete) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!publication.LCP || !publication.LCP.Links) {
            if (onStatusDocumentProcessingComplete) {
                onStatusDocumentProcessingComplete();
            }
            return;
        }
        const linkStatus = publication.LCP.Links.find((link) => {
            return link.Rel === "status";
        });
        if (!linkStatus) {
            if (onStatusDocumentProcessingComplete) {
                onStatusDocumentProcessingComplete();
            }
            return;
        }
        debug(linkStatus);
        const failure = (err) => {
            debug(err);
            onStatusDocumentProcessingComplete();
        };
        const success = (response) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                failure("HTTP CODE " + response.statusCode);
                return;
            }
            let responseData;
            try {
                responseData = yield BufferUtils_1.streamToBufferPromise(response);
            }
            catch (err) {
                debug(err);
                onStatusDocumentProcessingComplete();
                return;
            }
            if (!responseData) {
                onStatusDocumentProcessingComplete();
                return;
            }
            const responseStr = responseData.toString("utf8");
            debug(responseStr);
            const responseJson = global.JSON.parse(responseStr);
            debug(responseJson);
            if (responseJson.updated && responseJson.updated.license &&
                (publication.LCP.Updated || publication.LCP.Issued)) {
                const updatedLicenseLSD = moment(responseJson.updated.license);
                const updatedLicense = moment(publication.LCP.Updated || publication.LCP.Issued);
                const forceUpdate = false;
                if (forceUpdate || updatedLicense.isBefore(updatedLicenseLSD)) {
                    debug("LSD license updating...");
                    if (responseJson.links) {
                        const licenseLink = responseJson.links.find((link) => {
                            return link.rel === "license";
                        });
                        if (!licenseLink) {
                            debug("LSD license link is missing.");
                            onStatusDocumentProcessingComplete();
                            return;
                        }
                        yield fetchAndInjectUpdatedLicense(publication, publicationPath, licenseLink.href, onStatusDocumentProcessingComplete);
                        return;
                    }
                }
            }
            onStatusDocumentProcessingComplete();
        });
        const headers = {
            "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
        };
        const needsStreamingResponse = true;
        if (needsStreamingResponse) {
            request.get({
                headers,
                method: "GET",
                uri: linkStatus.Href,
            })
                .on("response", success)
                .on("error", failure);
        }
        else {
            let response;
            try {
                response = yield requestPromise({
                    headers,
                    method: "GET",
                    resolveWithFullResponse: true,
                    uri: linkStatus.Href,
                });
            }
            catch (err) {
                failure(err);
                return;
            }
            response = response;
            yield success(response);
        }
    });
}
exports.launchStatusDocumentProcessing = launchStatusDocumentProcessing;
function fetchAndInjectUpdatedLicense(publication, publicationPath, href, onStatusDocumentProcessingComplete) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug("OLD LCP LICENSE, FETCHING LSD UPDATE ... " + href);
        const failure = (err) => {
            debug(err);
            onStatusDocumentProcessingComplete();
        };
        const success = (response) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                if (href.indexOf("/licenses/") > 0) {
                    const newHref = href.replace("/licenses/", "/api/v1/purchases/license/");
                    debug("TRYING AGAIN: " + newHref);
                    yield fetchAndInjectUpdatedLicense(publication, publicationPath, newHref, onStatusDocumentProcessingComplete);
                }
                else {
                    failure("HTTP CODE " + response.statusCode);
                }
                return;
            }
            let responseData;
            try {
                responseData = yield BufferUtils_1.streamToBufferPromise(response);
            }
            catch (err) {
                debug(err);
                onStatusDocumentProcessingComplete();
                return;
            }
            if (!responseData) {
                onStatusDocumentProcessingComplete();
                return;
            }
            const lcplStr = responseData.toString("utf8");
            debug(lcplStr);
            const zipEntryPath = "META-INF/license.lcpl";
            let lcpl;
            try {
                const lcplJson = global.JSON.parse(lcplStr);
                debug(lcplJson);
                lcpl = ta_json_1.JSON.deserialize(lcplJson, lcp_1.LCP);
            }
            catch (erorz) {
                debug(erorz);
                onStatusDocumentProcessingComplete();
                return;
            }
            if (!lcpl) {
                onStatusDocumentProcessingComplete();
                return;
            }
            lcpl.ZipPath = zipEntryPath;
            lcpl.JsonSource = lcplStr;
            lcpl.init();
            publication.LCP = lcpl;
            const newPublicationPath = publicationPath + ".new";
            zipInjector_1.injectBufferInZip(publicationPath, newPublicationPath, responseData, zipEntryPath, (err) => {
                debug(err);
                onStatusDocumentProcessingComplete();
            }, () => {
                debug("EPUB license.lcpl injected.");
                setTimeout(() => {
                    fs.unlinkSync(publicationPath);
                    setTimeout(() => {
                        fs.renameSync(newPublicationPath, publicationPath);
                        onStatusDocumentProcessingComplete();
                    }, 500);
                }, 500);
            });
        });
        const headers = {
            "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
        };
        const needsStreamingResponse = true;
        if (needsStreamingResponse) {
            request.get({
                headers,
                method: "GET",
                uri: href,
            })
                .on("response", success)
                .on("error", failure);
        }
        else {
            let response;
            try {
                response = yield requestPromise({
                    headers,
                    method: "GET",
                    resolveWithFullResponse: true,
                    uri: href,
                });
            }
            catch (err) {
                failure(err);
                return;
            }
            response = response;
            yield success(response);
        }
    });
}
//# sourceMappingURL=lsd.js.map