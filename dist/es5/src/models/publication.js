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
var forge = require("node-forge");
var ta_json_1 = require("ta-json");
var metadata_1 = require("./metadata");
var publication_link_1 = require("./publication-link");
var Publication = (function () {
    function Publication() {
    }
    Publication.prototype.freeDestroy = function () {
        console.log("freeDestroy: Publication");
        if (this.Internal) {
            var zipInternal = this.Internal.find(function (i) {
                if (i.Name === "zip") {
                    return true;
                }
                return false;
            });
            if (zipInternal) {
                var zip = zipInternal.Value;
                zip.freeDestroy();
            }
        }
    };
    Publication.prototype.UpdateLCP = function (lcpPassHash) {
        if (!this.LCP) {
            return undefined;
        }
        var userKey = forge.util.hexToBytes(lcpPassHash);
        if (userKey
            && this.LCP.Encryption.UserKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#sha256"
            && this.LCP.Encryption.Profile === "http://readium.org/lcp/basic-profile"
            && this.LCP.Encryption.ContentKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc") {
            try {
                var keyCheck = new Buffer(this.LCP.Encryption.UserKey.KeyCheck, "base64").toString("binary");
                var encryptedLicenseID = keyCheck;
                var AES_BLOCK_SIZE = 16;
                var iv = encryptedLicenseID.substring(0, AES_BLOCK_SIZE);
                var toDecrypt = forge.util.createBuffer(encryptedLicenseID.substring(AES_BLOCK_SIZE), "binary");
                var aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", userKey);
                aesCbcDecipher.start({ iv: iv, additionalData_: "binary-encoded string" });
                aesCbcDecipher.update(toDecrypt);
                aesCbcDecipher.finish();
                if (this.LCP.ID === aesCbcDecipher.output.toString()) {
                    var encryptedContentKey = new Buffer(this.LCP.Encryption.ContentKey.EncryptedValue, "base64").toString("binary");
                    var iv2 = encryptedContentKey.substring(0, AES_BLOCK_SIZE);
                    var toDecrypt2 = forge.util.createBuffer(encryptedContentKey.substring(AES_BLOCK_SIZE), "binary");
                    var aesCbcDecipher2 = forge.cipher.createDecipher("AES-CBC", userKey);
                    aesCbcDecipher2.start({ iv: iv2, additionalData_: "binary-encoded string" });
                    aesCbcDecipher2.update(toDecrypt2);
                    aesCbcDecipher2.finish();
                    var contentKey = aesCbcDecipher2.output.bytes();
                    this.AddToInternal("lcp_content_key", contentKey);
                    return contentKey;
                }
            }
            catch (err) {
                console.log("LCP error! " + err);
            }
        }
        return undefined;
    };
    Publication.prototype.findFromInternal = function (key) {
        if (this.Internal) {
            var found = this.Internal.find(function (internal) {
                return internal.Name === key;
            });
            if (found) {
                return found;
            }
        }
        return undefined;
    };
    Publication.prototype.AddToInternal = function (key, value) {
        if (!this.Internal) {
            this.Internal = [];
        }
        var internal = { Name: key, Value: value };
        this.Internal.push(internal);
    };
    Publication.prototype.GetCover = function () {
        return this.searchLinkByRel("cover");
    };
    Publication.prototype.GetNavDoc = function () {
        return this.searchLinkByRel("contents");
    };
    Publication.prototype.searchLinkByRel = function (rel) {
        if (this.Resources) {
            var ll = this.Resources.find(function (link) {
                if (link.Rel) {
                    var rr = link.Rel.find(function (r) {
                        if (r === rel) {
                            return true;
                        }
                        return false;
                    });
                    if (rr) {
                        return true;
                    }
                }
                return false;
            });
            if (ll) {
                return ll;
            }
        }
        if (this.Spine) {
            var ll = this.Spine.find(function (link) {
                if (link.Rel) {
                    var rr = link.Rel.find(function (r) {
                        if (r === rel) {
                            return true;
                        }
                        return false;
                    });
                    if (rr) {
                        return true;
                    }
                }
                return false;
            });
            if (ll) {
                return ll;
            }
        }
        if (this.Links) {
            var ll = this.Links.find(function (link) {
                if (link.Rel) {
                    var rr = link.Rel.find(function (r) {
                        if (r === rel) {
                            return true;
                        }
                        return false;
                    });
                    if (rr) {
                        return true;
                    }
                }
                return false;
            });
            if (ll) {
                return ll;
            }
        }
        return undefined;
    };
    Publication.prototype.AddLink = function (typeLink, rel, url, templated) {
        var link = new publication_link_1.Link();
        link.Rel = rel;
        link.Href = url;
        link.TypeLink = typeLink;
        link.Templated = templated;
        if (!this.Links) {
            this.Links = [];
        }
        this.Links.push(link);
    };
    Publication.prototype.FindAllMediaOverlay = function () {
        var mos = [];
        if (this.Spine) {
            this.Spine.forEach(function (link) {
                if (link.MediaOverlays) {
                    link.MediaOverlays.forEach(function (mo) {
                        mos.push(mo);
                    });
                }
            });
        }
        return mos;
    };
    Publication.prototype.FindMediaOverlayByHref = function (href) {
        var mos = [];
        if (this.Spine) {
            this.Spine.forEach(function (link) {
                if (link.MediaOverlays && link.Href.indexOf(href) >= 0) {
                    link.MediaOverlays.forEach(function (mo) {
                        mos.push(mo);
                    });
                }
            });
        }
        return mos;
    };
    Publication.prototype.GetPreFetchResources = function () {
        var links = [];
        if (this.Resources) {
            var mediaTypes_1 = ["text/css", "application/vnd.ms-opentype", "text/javascript"];
            this.Resources.forEach(function (link) {
                mediaTypes_1.forEach(function (mediaType) {
                    if (link.TypeLink === mediaType) {
                        links.push(link);
                    }
                });
            });
        }
        return links;
    };
    Publication.prototype._OnDeserialized = function () {
        if (!this.Metadata) {
            console.log("Publication.Metadata is not set!");
        }
        if (!this.Links) {
            console.log("Publication.Links is not set!");
        }
        if (!this.Spine) {
            console.log("Publication.Spine is not set!");
        }
    };
    return Publication;
}());
__decorate([
    ta_json_1.JsonProperty("@context"),
    ta_json_1.JsonElementType(String),
    __metadata("design:type", Array)
], Publication.prototype, "Context", void 0);
__decorate([
    ta_json_1.JsonProperty("metadata"),
    __metadata("design:type", metadata_1.Metadata)
], Publication.prototype, "Metadata", void 0);
__decorate([
    ta_json_1.JsonProperty("links"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "Links", void 0);
__decorate([
    ta_json_1.JsonProperty("spine"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "Spine", void 0);
__decorate([
    ta_json_1.JsonProperty("resources"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "Resources", void 0);
__decorate([
    ta_json_1.JsonProperty("toc"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "TOC", void 0);
__decorate([
    ta_json_1.JsonProperty("page-list"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "PageList", void 0);
__decorate([
    ta_json_1.JsonProperty("landmarks"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "Landmarks", void 0);
__decorate([
    ta_json_1.JsonProperty("loi"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "LOI", void 0);
__decorate([
    ta_json_1.JsonProperty("loa"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "LOA", void 0);
__decorate([
    ta_json_1.JsonProperty("lov"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "LOV", void 0);
__decorate([
    ta_json_1.JsonProperty("lot"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "LOT", void 0);
__decorate([
    ta_json_1.JsonProperty("images"),
    ta_json_1.JsonElementType(publication_link_1.Link),
    __metadata("design:type", Array)
], Publication.prototype, "Images", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Publication.prototype, "_OnDeserialized", null);
Publication = __decorate([
    ta_json_1.JsonObject()
], Publication);
exports.Publication = Publication;
//# sourceMappingURL=publication.js.map