"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var opds2_1 = require("../opds/opds2/opds2");
var opds2_contributor_1 = require("../opds/opds2/opds2-contributor");
var opds2_link_1 = require("../opds/opds2/opds2-link");
var opds2_metadata_1 = require("../opds/opds2/opds2-metadata");
var opds2_publication_1 = require("../opds/opds2/opds2-publication");
var opds2_publicationMetadata_1 = require("../opds/opds2/opds2-publicationMetadata");
var cbz_1 = require("../parser/cbz");
var epub_1 = require("../parser/epub");
var UrlUtils_1 = require("../_utils/http/UrlUtils");
var debug_ = require("debug");
var moment = require("moment");
var ta_json_1 = require("ta-json");
var debug = debug_("r2:opds2create");
debug("process.cwd(): " + process.cwd());
debug("__dirname: " + __dirname);
var args = process.argv.slice(2);
if (!args.length) {
    debug("FILEPATH ARGUMENTS ARE MISSING.");
    process.exit(1);
}
var opdsJsonFilePath = args[0];
args = args.slice(1);
if (fs.existsSync(opdsJsonFilePath)) {
    debug("OPDS2 JSON file already exists.");
    process.exit(1);
}
(function () { return __awaiter(_this, void 0, void 0, function () {
    var feed, nPubs, _loop_1, _i, args_1, pathBase64, jsonObj, jsonStr;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                feed = new opds2_1.OPDSFeed();
                feed.Context = ["http://opds-spec.org/opds.jsonld"];
                feed.Metadata = new opds2_metadata_1.OPDSMetadata();
                feed.Metadata.RDFType = "http://schema.org/DataFeed";
                feed.Metadata.Title = "Readium 2 OPDS 2.0 Feed";
                feed.Metadata.Modified = moment(Date.now()).toDate();
                feed.Publications = [];
                nPubs = 0;
                _loop_1 = function (pathBase64) {
                    var pathBase64Str, fileName, ext, publication, _a, err_1, filePathBase64Encoded, publi, linkSelf, coverLink, linkCover;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                pathBase64Str = new Buffer(pathBase64, "base64").toString("utf8");
                                if (UrlUtils_1.isHTTP(pathBase64Str)) {
                                    return [2, "continue"];
                                }
                                fileName = path.basename(pathBase64Str);
                                ext = path.extname(fileName).toLowerCase();
                                debug("OPDS parsing: " + pathBase64Str);
                                publication = void 0;
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 6, , 7]);
                                if (!(ext === ".epub")) return [3, 3];
                                return [4, epub_1.EpubParsePromise(pathBase64Str)];
                            case 2:
                                _a = _b.sent();
                                return [3, 5];
                            case 3: return [4, cbz_1.CbzParsePromise(pathBase64Str)];
                            case 4:
                                _a = _b.sent();
                                _b.label = 5;
                            case 5:
                                publication = _a;
                                return [3, 7];
                            case 6:
                                err_1 = _b.sent();
                                debug(err_1);
                                return [2, "continue"];
                            case 7:
                                nPubs++;
                                filePathBase64Encoded = UrlUtils_1.encodeURIComponent_RFC3986(pathBase64);
                                publi = new opds2_publication_1.OPDSPublication();
                                publi.Links = [];
                                linkSelf = new opds2_link_1.OPDSLink();
                                linkSelf.Href = filePathBase64Encoded + "/manifest.json";
                                linkSelf.TypeLink = "application/webpub+json";
                                linkSelf.Rel = [];
                                linkSelf.Rel.push("self");
                                publi.Links.push(linkSelf);
                                publi.Images = [];
                                coverLink = publication.GetCover();
                                if (coverLink) {
                                    linkCover = new opds2_link_1.OPDSLink();
                                    linkCover.Href = filePathBase64Encoded + "/" + coverLink.Href;
                                    linkCover.TypeLink = coverLink.TypeLink;
                                    if (coverLink.Width && coverLink.Height) {
                                        linkCover.Width = coverLink.Width;
                                        linkCover.Height = coverLink.Height;
                                    }
                                    publi.Images.push(linkCover);
                                }
                                if (feed.Metadata) {
                                    publi.Metadata = new opds2_publicationMetadata_1.OPDSPublicationMetadata();
                                    if (publication.Metadata.Artist) {
                                        publi.Metadata.Artist = [];
                                        publication.Metadata.Artist.forEach(function (contributor) {
                                            var c = new opds2_contributor_1.OPDSContributor();
                                            if (contributor.Identifier) {
                                                c.Identifier = contributor.Identifier;
                                            }
                                            if (contributor.Name) {
                                                c.Name = contributor.Name;
                                            }
                                            if (contributor.Role) {
                                                c.Role = contributor.Role;
                                            }
                                            if (contributor.SortAs) {
                                                c.SortAs = contributor.SortAs;
                                            }
                                            publi.Metadata.Artist.push(c);
                                        });
                                    }
                                }
                                feed.Publications.push(publi);
                                return [2];
                        }
                    });
                };
                _i = 0, args_1 = args;
                _a.label = 1;
            case 1:
                if (!(_i < args_1.length)) return [3, 4];
                pathBase64 = args_1[_i];
                return [5, _loop_1(pathBase64)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3, 1];
            case 4:
                feed.Metadata.NumberOfItems = nPubs;
                jsonObj = ta_json_1.JSON.serialize(feed);
                jsonStr = global.JSON.stringify(jsonObj, null, "");
                fs.writeFileSync(opdsJsonFilePath, jsonStr, "utf8");
                debug("DONE! :)");
                debug(opdsJsonFilePath);
                return [2];
        }
    });
}); })();
//# sourceMappingURL=opds2-create-cli.js.map