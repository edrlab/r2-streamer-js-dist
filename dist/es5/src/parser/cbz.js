"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var metadata_1 = require("../models/metadata");
var metadata_contributor_1 = require("../models/metadata-contributor");
var publication_1 = require("../models/publication");
var publication_link_1 = require("../models/publication-link");
var BufferUtils_1 = require("../_utils/stream/BufferUtils");
var xml_js_mapper_1 = require("../_utils/xml-js-mapper");
var zipFactory_1 = require("../_utils/zip/zipFactory");
var mime = require("mime-types");
var slugify = require("slugify");
var xmldom = require("xmldom");
var comicrack_1 = require("./comicrack/comicrack");
var epub_1 = require("./epub");
function CbzParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var zip, err_1, publication, comicInfoEntryName, _b, err_2;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, zipFactory_1.zipLoadPromise(filePath)];
                case 1:
                    zip = _a.sent();
                    return [3, 3];
                case 2:
                    err_1 = _a.sent();
                    return [2, Promise.reject(err_1)];
                case 3:
                    if (!zip.hasEntries()) {
                        return [2, Promise.reject("CBZ zip empty")];
                    }
                    publication = new publication_1.Publication();
                    publication.Context = ["http://readium.org/webpub/default.jsonld"];
                    publication.Metadata = new metadata_1.Metadata();
                    publication.Metadata.RDFType = "http://schema.org/ComicIssue";
                    publication.Metadata.Identifier = filePathToTitle(filePath);
                    publication.AddToInternal("type", "cbz");
                    publication.AddToInternal("zip", zip);
                    zip.forEachEntry(function (entryName) {
                        var link = new publication_link_1.Link();
                        link.Href = entryName;
                        var mediaType = mime.lookup(entryName);
                        if (mediaType) {
                            link.TypeLink = mediaType;
                        }
                        else {
                            console.log("!!!!!! NO MEDIA TYPE?!");
                        }
                        if (link.TypeLink && link.TypeLink.startsWith("image/")) {
                            if (!publication.Spine) {
                                publication.Spine = [];
                            }
                            publication.Spine.push(link);
                        }
                        else if (entryName.endsWith("ComicInfo.xml")) {
                            comicInfoEntryName = entryName;
                        }
                    });
                    if (!publication.Metadata.Title) {
                        publication.Metadata.Title = path.basename(filePath);
                    }
                    if (!comicInfoEntryName) return [3, 7];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4, comicRackMetadata(zip, comicInfoEntryName, publication)];
                case 5:
                    _b = _a.sent();
                    console.log(_b);
                    return [3, 7];
                case 6:
                    err_2 = _a.sent();
                    console.log(err_2);
                    return [3, 7];
                case 7: return [2, publication];
            }
        });
    });
}
exports.CbzParsePromise = CbzParsePromise;
var filePathToTitle = function (filePath) {
    var fileName = path.basename(filePath);
    return slugify(fileName, "_").replace(/[\.]/g, "_");
};
var comicRackMetadata = function (zip, entryName, publication) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var comicZipStream_, err_3, comicZipStream, comicZipData, err_4, comicXmlStr, comicXmlDoc, comicMeta, cont, cont, cont, cont, title, _i, _a, p, l;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4, zip.entryStreamPromise(entryName)];
            case 1:
                comicZipStream_ = _c.sent();
                return [3, 3];
            case 2:
                err_3 = _c.sent();
                console.log(err_3);
                return [2];
            case 3:
                comicZipStream = comicZipStream_.stream;
                _c.label = 4;
            case 4:
                _c.trys.push([4, 6, , 7]);
                return [4, BufferUtils_1.streamToBufferPromise(comicZipStream)];
            case 5:
                comicZipData = _c.sent();
                return [3, 7];
            case 6:
                err_4 = _c.sent();
                console.log(err_4);
                return [2];
            case 7:
                comicXmlStr = comicZipData.toString("utf8");
                comicXmlDoc = new xmldom.DOMParser().parseFromString(comicXmlStr);
                comicMeta = xml_js_mapper_1.XML.deserialize(comicXmlDoc, comicrack_1.ComicInfo);
                comicMeta.ZipPath = entryName;
                if (!publication.Metadata) {
                    publication.Metadata = new metadata_1.Metadata();
                }
                if (comicMeta.Writer) {
                    cont = new metadata_contributor_1.Contributor();
                    cont.Name = comicMeta.Writer;
                    if (!publication.Metadata.Author) {
                        publication.Metadata.Author = [];
                    }
                    publication.Metadata.Author.push(cont);
                }
                if (comicMeta.Penciller) {
                    cont = new metadata_contributor_1.Contributor();
                    cont.Name = comicMeta.Writer;
                    if (!publication.Metadata.Penciler) {
                        publication.Metadata.Penciler = [];
                    }
                    publication.Metadata.Penciler.push(cont);
                }
                if (comicMeta.Colorist) {
                    cont = new metadata_contributor_1.Contributor();
                    cont.Name = comicMeta.Writer;
                    if (!publication.Metadata.Colorist) {
                        publication.Metadata.Colorist = [];
                    }
                    publication.Metadata.Colorist.push(cont);
                }
                if (comicMeta.Inker) {
                    cont = new metadata_contributor_1.Contributor();
                    cont.Name = comicMeta.Writer;
                    if (!publication.Metadata.Inker) {
                        publication.Metadata.Inker = [];
                    }
                    publication.Metadata.Inker.push(cont);
                }
                if (comicMeta.Title) {
                    publication.Metadata.Title = comicMeta.Title;
                }
                if (!publication.Metadata.Title) {
                    if (comicMeta.Series) {
                        title = comicMeta.Series;
                        if (comicMeta.Number) {
                            title = title + " - " + comicMeta.Number;
                        }
                        publication.Metadata.Title = title;
                    }
                }
                if (!comicMeta.Pages) return [3, 12];
                _i = 0, _a = comicMeta.Pages;
                _c.label = 8;
            case 8:
                if (!(_i < _a.length)) return [3, 12];
                p = _a[_i];
                l = new publication_link_1.Link();
                if (!(p.Type === "FrontCover")) return [3, 10];
                l.AddRel("cover");
                return [4, epub_1.addCoverDimensions(publication, l)];
            case 9:
                _c.sent();
                _c.label = 10;
            case 10:
                l.Href = publication.Spine[p.Image].Href;
                if (p.ImageHeight) {
                    l.Height = p.ImageHeight;
                }
                if (p.ImageWidth) {
                    l.Width = p.ImageWidth;
                }
                if (p.Bookmark) {
                    l.Title = p.Bookmark;
                }
                if (!publication.TOC) {
                    publication.TOC = [];
                }
                publication.TOC.push(l);
                _c.label = 11;
            case 11:
                _i++;
                return [3, 8];
            case 12: return [2];
        }
    });
}); };
//# sourceMappingURL=cbz.js.map