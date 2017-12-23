"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var opds2_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2");
var opds2_contributor_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-contributor");
var opds2_link_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-link");
var opds2_metadata_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-metadata");
var opds2_publication_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-publication");
var opds2_publicationMetadata_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-publicationMetadata");
var publication_parser_1 = require("r2-shared-js/dist/es5/src/parser/publication-parser");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
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
(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var feed, nPubs, _loop_1, _i, args_1, pathBase64, jsonObj, jsonStr;
    return tslib_1.__generator(this, function (_a) {
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
                    var pathBase64Str, publication, err_1, filePathBase64Encoded, publi, linkSelf, coverLink, linkCover;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                pathBase64Str = new Buffer(pathBase64, "base64").toString("utf8");
                                if (UrlUtils_1.isHTTP(pathBase64Str)) {
                                    return [2, "continue"];
                                }
                                debug("OPDS parsing: " + pathBase64Str);
                                publication = void 0;
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4, publication_parser_1.PublicationParsePromise(pathBase64Str)];
                            case 2:
                                publication = _a.sent();
                                return [3, 4];
                            case 3:
                                err_1 = _a.sent();
                                debug(err_1);
                                return [2, "continue"];
                            case 4:
                                nPubs++;
                                filePathBase64Encoded = UrlUtils_1.encodeURIComponent_RFC3986(pathBase64);
                                publi = new opds2_publication_1.OPDSPublication();
                                publi.Links = [];
                                linkSelf = new opds2_link_1.OPDSLink();
                                linkSelf.Href = filePathBase64Encoded + "/manifest.json";
                                linkSelf.TypeLink = "application/webpub+json";
                                linkSelf.AddRel("self");
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
                fs.writeFileSync(opdsJsonFilePath, jsonStr, { encoding: "utf8" });
                debug("DONE! :)");
                debug(opdsJsonFilePath);
                return [2];
        }
    });
}); })();
//# sourceMappingURL=opds2-create-cli.js.map