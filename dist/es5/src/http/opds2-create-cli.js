"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var moment = require("moment");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var init_globals_1 = require("r2-opds-js/dist/es5/src/opds/init-globals");
var opds2_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2");
var opds2_link_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-link");
var opds2_metadata_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-metadata");
var opds2_publication_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-publication");
var init_globals_2 = require("r2-shared-js/dist/es5/src/init-globals");
var metadata_1 = require("r2-shared-js/dist/es5/src/models/metadata");
var publication_parser_1 = require("r2-shared-js/dist/es5/src/parser/publication-parser");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
init_globals_1.initGlobalConverters_OPDS();
init_globals_2.initGlobalConverters_SHARED();
init_globals_2.initGlobalConverters_GENERIC();
console.log("process.cwd(): " + process.cwd());
console.log("__dirname: " + __dirname);
var args = process.argv.slice(2);
if (!args.length) {
    console.log("FILEPATH ARGUMENTS ARE MISSING.");
    process.exit(1);
}
var opdsJsonFilePath = args[0];
args = args.slice(1);
if (fs.existsSync(opdsJsonFilePath)) {
    console.log("OPDS2 JSON file already exists.");
    process.exit(1);
}
(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var feed, nPubs, _i, args_1, pathBase64, pathBase64Str, publication, err_1, publi, linkSelf, coverLink, linkCover, publicationMetadataJson, jsonObj, jsonStr;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                feed = new opds2_1.OPDSFeed();
                feed.Metadata = new opds2_metadata_1.OPDSMetadata();
                feed.Metadata.RDFType = "http://schema.org/DataFeed";
                feed.Metadata.Title = "Readium 2 OPDS 2.0 Feed";
                feed.Metadata.Modified = moment(Date.now()).toDate();
                feed.Publications = [];
                nPubs = 0;
                _i = 0, args_1 = args;
                _a.label = 1;
            case 1:
                if (!(_i < args_1.length)) return [3, 7];
                pathBase64 = args_1[_i];
                pathBase64Str = Buffer.from(decodeURIComponent(pathBase64), "base64").toString("utf8");
                if (UrlUtils_1.isHTTP(pathBase64Str)) {
                    return [3, 6];
                }
                console.log("OPDS parsing: " + pathBase64Str);
                publication = void 0;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4, publication_parser_1.PublicationParsePromise(pathBase64Str)];
            case 3:
                publication = _a.sent();
                return [3, 5];
            case 4:
                err_1 = _a.sent();
                console.log(err_1);
                return [3, 6];
            case 5:
                nPubs++;
                publi = new opds2_publication_1.OPDSPublication();
                publi.Links = [];
                linkSelf = new opds2_link_1.OPDSLink();
                linkSelf.Href = pathBase64 + "/manifest.json";
                linkSelf.TypeLink =
                    (publication.Metadata && publication.Metadata.RDFType &&
                        /http[s]?:\/\/schema\.org\/Audiobook$/.test(publication.Metadata.RDFType)) ?
                        "application/audiobook+json" : ((publication.Metadata && publication.Metadata.RDFType &&
                        (/http[s]?:\/\/schema\.org\/ComicStory$/.test(publication.Metadata.RDFType) ||
                            /http[s]?:\/\/schema\.org\/VisualNarrative$/.test(publication.Metadata.RDFType))) ? "application/divina+json" :
                        "application/webpub+json");
                linkSelf.AddRel("http://opds-spec.org/acquisition");
                publi.Links.push(linkSelf);
                feed.Publications.push(publi);
                publi.Images = [];
                coverLink = publication.GetCover();
                if (coverLink) {
                    linkCover = new opds2_link_1.OPDSLink();
                    linkCover.Href = pathBase64 + "/" + coverLink.Href;
                    linkCover.TypeLink = coverLink.TypeLink;
                    if (coverLink.Width && coverLink.Height) {
                        linkCover.Width = coverLink.Width;
                        linkCover.Height = coverLink.Height;
                    }
                    publi.Images.push(linkCover);
                }
                else {
                    console.log("NO COVER IMAGE?");
                }
                if (publication.Metadata) {
                    try {
                        publicationMetadataJson = serializable_1.TaJsonSerialize(publication.Metadata);
                        publi.Metadata = serializable_1.TaJsonDeserialize(publicationMetadataJson, metadata_1.Metadata);
                    }
                    catch (err) {
                        console.log(err);
                        return [3, 6];
                    }
                }
                _a.label = 6;
            case 6:
                _i++;
                return [3, 1];
            case 7:
                feed.Metadata.NumberOfItems = nPubs;
                jsonObj = serializable_1.TaJsonSerialize(feed);
                jsonStr = global.JSON.stringify(jsonObj, null, "");
                fs.writeFileSync(opdsJsonFilePath, jsonStr, { encoding: "utf8" });
                console.log("DONE! :)");
                console.log(opdsJsonFilePath);
                return [2];
        }
    });
}); })();
//# sourceMappingURL=opds2-create-cli.js.map