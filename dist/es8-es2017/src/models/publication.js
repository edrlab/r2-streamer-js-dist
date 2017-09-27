"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ta_json_string_converter_1 = require("../_utils/ta-json-string-converter");
const ta_json_1 = require("ta-json");
const metadata_1 = require("./metadata");
const publication_link_1 = require("./publication-link");
let Publication = class Publication {
    freeDestroy() {
        console.log("freeDestroy: Publication");
        if (this.Internal) {
            const zipInternal = this.findFromInternal("zip");
            if (zipInternal) {
                const zip = zipInternal.Value;
                zip.freeDestroy();
            }
        }
    }
    findFromInternal(key) {
        if (this.Internal) {
            const found = this.Internal.find((internal) => {
                return internal.Name === key;
            });
            if (found) {
                return found;
            }
        }
        return undefined;
    }
    AddToInternal(key, value) {
        const existing = this.findFromInternal(key);
        if (existing) {
            existing.Value = value;
        }
        else {
            if (!this.Internal) {
                this.Internal = [];
            }
            const internal = { Name: key, Value: value };
            this.Internal.push(internal);
        }
    }
    GetCover() {
        return this.searchLinkByRel("cover");
    }
    GetNavDoc() {
        return this.searchLinkByRel("contents");
    }
    searchLinkByRel(rel) {
        if (this.Resources) {
            const ll = this.Resources.find((link) => {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }
        if (this.Spine) {
            const ll = this.Spine.find((link) => {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }
        if (this.Links) {
            const ll = this.Links.find((link) => {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }
        return undefined;
    }
    AddLink(typeLink, rel, url, templated) {
        const link = new publication_link_1.Link();
        link.AddRels(rel);
        link.Href = url;
        link.TypeLink = typeLink;
        link.Templated = templated;
        if (!this.Links) {
            this.Links = [];
        }
        this.Links.push(link);
    }
    FindAllMediaOverlay() {
        const mos = [];
        if (this.Spine) {
            this.Spine.forEach((link) => {
                if (link.MediaOverlays) {
                    link.MediaOverlays.forEach((mo) => {
                        mos.push(mo);
                    });
                }
            });
        }
        return mos;
    }
    FindMediaOverlayByHref(href) {
        const mos = [];
        if (this.Spine) {
            this.Spine.forEach((link) => {
                if (link.MediaOverlays && link.Href.indexOf(href) >= 0) {
                    link.MediaOverlays.forEach((mo) => {
                        mos.push(mo);
                    });
                }
            });
        }
        return mos;
    }
    GetPreFetchResources() {
        const links = [];
        if (this.Resources) {
            const mediaTypes = ["text/css", "application/vnd.ms-opentype", "text/javascript"];
            this.Resources.forEach((link) => {
                mediaTypes.forEach((mediaType) => {
                    if (link.TypeLink === mediaType) {
                        links.push(link);
                    }
                });
            });
        }
        return links;
    }
    _OnDeserialized() {
        if (!this.Metadata) {
            console.log("Publication.Metadata is not set!");
        }
        if (!this.Links) {
            console.log("Publication.Links is not set!");
        }
    }
};
tslib_1.__decorate([
    ta_json_1.JsonProperty("@context"),
    ta_json_1.JsonConverter(ta_json_string_converter_1.JsonStringConverter),
    ta_json_1.JsonElementType(String),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Context", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("metadata"),
    tslib_1.__metadata("design:type", metadata_1.Metadata)
], Publication.prototype, "Metadata", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("links"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Links", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("spine"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Spine", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("resources"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Resources", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("toc"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "TOC", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("page-list"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "PageList", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("landmarks"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Landmarks", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("loi"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "LOI", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("loa"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "LOA", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("lov"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "LOV", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("lot"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "LOT", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("images"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Images", void 0);
tslib_1.__decorate([
    ta_json_1.OnDeserialized(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], Publication.prototype, "_OnDeserialized", null);
Publication = tslib_1.__decorate([
    ta_json_1.JsonObject()
], Publication);
exports.Publication = Publication;
//# sourceMappingURL=publication.js.map