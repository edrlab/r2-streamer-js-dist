"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var BufferUtils_1 = require("../../../../es8-es2017/src/_utils/stream/BufferUtils");
var zipInjector_1 = require("../../../../es8-es2017/src/_utils/zip/zipInjector");
var lcp_1 = require("../../../../es8-es2017/src/parser/epub/lcp");
var debug_ = require("debug");
var moment = require("moment");
var request = require("request");
var requestPromise = require("request-promise-native");
var ta_json_1 = require("ta-json");
var debug = debug_("r2:lsd");
exports.deviceIDManager = {
    checkDeviceID: function (_key) {
        return "";
    },
    getDeviceID: function () {
        return "";
    },
    getDeviceNAME: function () {
        return "";
    },
    recordDeviceID: function (_key) {
        return;
    },
};
function launchStatusDocumentProcessing(publication, publicationPath, _deviceIDManager, onStatusDocumentProcessingComplete) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _this = this;
        var linkStatus, failure, success, headers, needsStreamingResponse, response, err_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!publication.LCP || !publication.LCP.Links) {
                        if (onStatusDocumentProcessingComplete) {
                            onStatusDocumentProcessingComplete();
                        }
                        return [2];
                    }
                    linkStatus = publication.LCP.Links.find(function (link) {
                        return link.Rel === "status";
                    });
                    if (!linkStatus) {
                        if (onStatusDocumentProcessingComplete) {
                            onStatusDocumentProcessingComplete();
                        }
                        return [2];
                    }
                    debug(linkStatus);
                    failure = function (err) {
                        debug(err);
                        onStatusDocumentProcessingComplete();
                    };
                    success = function (response) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var responseData, err_2, responseStr, responseJson, updatedLicenseLSD, updatedLicense, forceUpdate, licenseLink;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (response.statusCode && (response.statusCode < 200 || response.statusCode >= 300)) {
                                        failure("HTTP CODE " + response.statusCode);
                                        return [2];
                                    }
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4, BufferUtils_1.streamToBufferPromise(response)];
                                case 2:
                                    responseData = _a.sent();
                                    return [3, 4];
                                case 3:
                                    err_2 = _a.sent();
                                    debug(err_2);
                                    onStatusDocumentProcessingComplete();
                                    return [2];
                                case 4:
                                    if (!responseData) {
                                        onStatusDocumentProcessingComplete();
                                        return [2];
                                    }
                                    responseStr = responseData.toString("utf8");
                                    debug(responseStr);
                                    responseJson = global.JSON.parse(responseStr);
                                    debug(responseJson);
                                    if (!(responseJson.updated && responseJson.updated.license &&
                                        (publication.LCP.Updated || publication.LCP.Issued))) return [3, 6];
                                    updatedLicenseLSD = moment(responseJson.updated.license);
                                    updatedLicense = moment(publication.LCP.Updated || publication.LCP.Issued);
                                    forceUpdate = false;
                                    if (!(forceUpdate || updatedLicense.isBefore(updatedLicenseLSD))) return [3, 6];
                                    debug("LSD license updating...");
                                    if (!responseJson.links) return [3, 6];
                                    licenseLink = responseJson.links.find(function (link) {
                                        return link.rel === "license";
                                    });
                                    if (!licenseLink) {
                                        debug("LSD license link is missing.");
                                        onStatusDocumentProcessingComplete();
                                        return [2];
                                    }
                                    return [4, fetchAndInjectUpdatedLicense(publication, publicationPath, licenseLink.href, onStatusDocumentProcessingComplete)];
                                case 5:
                                    _a.sent();
                                    return [2];
                                case 6:
                                    onStatusDocumentProcessingComplete();
                                    return [2];
                            }
                        });
                    }); };
                    headers = {
                        "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
                    };
                    needsStreamingResponse = true;
                    if (!needsStreamingResponse) return [3, 1];
                    request.get({
                        headers: headers,
                        method: "GET",
                        uri: linkStatus.Href,
                    })
                        .on("response", success)
                        .on("error", failure);
                    return [3, 7];
                case 1:
                    response = void 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4, requestPromise({
                            headers: headers,
                            method: "GET",
                            resolveWithFullResponse: true,
                            uri: linkStatus.Href,
                        })];
                case 3:
                    response = _a.sent();
                    return [3, 5];
                case 4:
                    err_1 = _a.sent();
                    failure(err_1);
                    return [2];
                case 5:
                    response = response;
                    return [4, success(response)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2];
            }
        });
    });
}
exports.launchStatusDocumentProcessing = launchStatusDocumentProcessing;
function fetchAndInjectUpdatedLicense(publication, publicationPath, href, onStatusDocumentProcessingComplete) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _this = this;
        var failure, success, headers, needsStreamingResponse, response, err_3;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    debug("OLD LCP LICENSE, FETCHING LSD UPDATE ... " + href);
                    failure = function (err) {
                        debug(err);
                        onStatusDocumentProcessingComplete();
                    };
                    success = function (response) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var newHref, responseData, err_4, lcplStr, zipEntryPath, lcpl, lcplJson, newPublicationPath;
                        return tslib_1.__generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(response.statusCode && (response.statusCode < 200 || response.statusCode >= 300))) return [3, 4];
                                    if (!(href.indexOf("/licenses/") > 0)) return [3, 2];
                                    newHref = href.replace("/licenses/", "/api/v1/purchases/license/");
                                    debug("TRYING AGAIN: " + newHref);
                                    return [4, fetchAndInjectUpdatedLicense(publication, publicationPath, newHref, onStatusDocumentProcessingComplete)];
                                case 1:
                                    _a.sent();
                                    return [3, 3];
                                case 2:
                                    failure("HTTP CODE " + response.statusCode);
                                    _a.label = 3;
                                case 3: return [2];
                                case 4:
                                    _a.trys.push([4, 6, , 7]);
                                    return [4, BufferUtils_1.streamToBufferPromise(response)];
                                case 5:
                                    responseData = _a.sent();
                                    return [3, 7];
                                case 6:
                                    err_4 = _a.sent();
                                    debug(err_4);
                                    onStatusDocumentProcessingComplete();
                                    return [2];
                                case 7:
                                    if (!responseData) {
                                        onStatusDocumentProcessingComplete();
                                        return [2];
                                    }
                                    lcplStr = responseData.toString("utf8");
                                    debug(lcplStr);
                                    zipEntryPath = "META-INF/license.lcpl";
                                    try {
                                        lcplJson = global.JSON.parse(lcplStr);
                                        debug(lcplJson);
                                        lcpl = ta_json_1.JSON.deserialize(lcplJson, lcp_1.LCP);
                                    }
                                    catch (erorz) {
                                        debug(erorz);
                                        onStatusDocumentProcessingComplete();
                                        return [2];
                                    }
                                    if (!lcpl) {
                                        onStatusDocumentProcessingComplete();
                                        return [2];
                                    }
                                    lcpl.ZipPath = zipEntryPath;
                                    lcpl.JsonSource = lcplStr;
                                    lcpl.init();
                                    publication.LCP = lcpl;
                                    newPublicationPath = publicationPath + ".new";
                                    zipInjector_1.injectBufferInZip(publicationPath, newPublicationPath, responseData, zipEntryPath, function (err) {
                                        debug(err);
                                        onStatusDocumentProcessingComplete();
                                    }, function () {
                                        debug("EPUB license.lcpl injected.");
                                        setTimeout(function () {
                                            fs.unlinkSync(publicationPath);
                                            setTimeout(function () {
                                                fs.renameSync(newPublicationPath, publicationPath);
                                                onStatusDocumentProcessingComplete();
                                            }, 500);
                                        }, 500);
                                    });
                                    return [2];
                            }
                        });
                    }); };
                    headers = {
                        "Accept-Language": "en-UK,en-US;q=0.7,en;q=0.5",
                    };
                    needsStreamingResponse = true;
                    if (!needsStreamingResponse) return [3, 1];
                    request.get({
                        headers: headers,
                        method: "GET",
                        uri: href,
                    })
                        .on("response", success)
                        .on("error", failure);
                    return [3, 7];
                case 1:
                    response = void 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4, requestPromise({
                            headers: headers,
                            method: "GET",
                            resolveWithFullResponse: true,
                            uri: href,
                        })];
                case 3:
                    response = _a.sent();
                    return [3, 5];
                case 4:
                    err_3 = _a.sent();
                    failure(err_3);
                    return [2];
                case 5:
                    response = response;
                    return [4, success(response)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2];
            }
        });
    });
}
//# sourceMappingURL=lsd.js.map