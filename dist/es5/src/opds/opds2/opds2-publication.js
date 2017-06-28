"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ta_json_1 = require("ta-json");
var opds2_contributor_1 = require("./opds2-contributor");
var opds2_link_1 = require("./opds2-link");
var opds2_publicationMetadata_1 = require("./opds2-publicationMetadata");
var OPDSPublication = (function () {
    function OPDSPublication() {
    }
    OPDSPublication.prototype.findFirstLinkByRel = function (rel) {
        return this.Links ? this.Links.find(function (l) {
            return l.Rel && typeof l.Rel.find(function (r) {
                return r === rel;
            }) !== "undefined";
        }) : undefined;
    };
    OPDSPublication.prototype.AddImage = function (href, typeImage, height, width) {
        var i = new opds2_link_1.OPDSLink();
        i.Href = href;
        i.TypeLink = typeImage;
        if (height) {
            i.Height = height;
        }
        if (width) {
            i.Width = width;
        }
        if (!this.Images) {
            this.Images = [];
        }
        this.Images.push(i);
    };
    OPDSPublication.prototype.AddLink = function (href, typeLink, rel, title) {
        var l = new opds2_link_1.OPDSLink();
        l.Href = href;
        l.TypeLink = typeLink;
        if (rel) {
            l.Rel = [];
            l.Rel.push(rel);
        }
        if (title) {
            l.Title = title;
        }
        if (!this.Links) {
            this.Links = [];
        }
        this.Links.push(l);
    };
    OPDSPublication.prototype.AddAuthor = function (name, identifier, sortAs, href, typeLink) {
        var c = new opds2_contributor_1.OPDSContributor();
        c.Name = name;
        if (identifier) {
            c.Identifier = identifier;
        }
        if (sortAs) {
            c.SortAs = sortAs;
        }
        var l = new opds2_link_1.OPDSLink();
        if (href) {
            l.Href = href;
        }
        if (typeLink) {
            l.TypeLink = typeLink;
        }
        if (href) {
            c.Links = [];
            c.Links.push(l);
        }
        if (!this.Metadata) {
            this.Metadata = new opds2_publicationMetadata_1.OPDSPublicationMetadata();
        }
        if (!this.Metadata.Author) {
            this.Metadata.Author = [];
        }
        this.Metadata.Author.push(c);
    };
    OPDSPublication.prototype._OnDeserialized = function () {
        if (!this.Metadata) {
            console.log("OPDSPublication.Metadata is not set!");
        }
        if (!this.Links) {
            console.log("OPDSPublication.Links is not set!");
        }
        if (!this.Images) {
            console.log("OPDSPublication.Images is not set!");
        }
    };
    __decorate([
        ta_json_1.JsonProperty("metadata"),
        __metadata("design:type", opds2_publicationMetadata_1.OPDSPublicationMetadata)
    ], OPDSPublication.prototype, "Metadata", void 0);
    __decorate([
        ta_json_1.JsonProperty("links"),
        ta_json_1.JsonElementType(opds2_link_1.OPDSLink),
        __metadata("design:type", Array)
    ], OPDSPublication.prototype, "Links", void 0);
    __decorate([
        ta_json_1.JsonProperty("images"),
        ta_json_1.JsonElementType(opds2_link_1.OPDSLink),
        __metadata("design:type", Array)
    ], OPDSPublication.prototype, "Images", void 0);
    __decorate([
        ta_json_1.OnDeserialized(),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], OPDSPublication.prototype, "_OnDeserialized", null);
    OPDSPublication = __decorate([
        ta_json_1.JsonObject()
    ], OPDSPublication);
    return OPDSPublication;
}());
exports.OPDSPublication = OPDSPublication;
//# sourceMappingURL=opds2-publication.js.map