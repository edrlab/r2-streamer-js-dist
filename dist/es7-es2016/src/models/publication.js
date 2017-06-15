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
const forge = require("node-forge");
const ta_json_1 = require("ta-json");
const metadata_1 = require("./metadata");
const publication_link_1 = require("./publication-link");
let Publication = class Publication {
    UpdateLCP(lcpPassHash) {
        if (!this.LCP) {
            return undefined;
        }
        const userKey = forge.util.hexToBytes(lcpPassHash);
        if (userKey
            && this.LCP.Encryption.UserKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#sha256"
            && this.LCP.Encryption.Profile === "http://readium.org/lcp/basic-profile"
            && this.LCP.Encryption.ContentKey.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc") {
            try {
                const keyCheck = new Buffer(this.LCP.Encryption.UserKey.KeyCheck, "base64").toString("binary");
                const encryptedLicenseID = keyCheck;
                const AES_BLOCK_SIZE = 16;
                const iv = encryptedLicenseID.substring(0, AES_BLOCK_SIZE);
                const toDecrypt = forge.util.createBuffer(encryptedLicenseID.substring(AES_BLOCK_SIZE), "binary");
                const aesCbcDecipher = forge.cipher.createDecipher("AES-CBC", userKey);
                aesCbcDecipher.start({ iv, additionalData_: "binary-encoded string" });
                aesCbcDecipher.update(toDecrypt);
                aesCbcDecipher.finish();
                if (this.LCP.ID === aesCbcDecipher.output.toString()) {
                    const encryptedContentKey = new Buffer(this.LCP.Encryption.ContentKey.EncryptedValue, "base64").toString("binary");
                    const iv2 = encryptedContentKey.substring(0, AES_BLOCK_SIZE);
                    const toDecrypt2 = forge.util.createBuffer(encryptedContentKey.substring(AES_BLOCK_SIZE), "binary");
                    const aesCbcDecipher2 = forge.cipher.createDecipher("AES-CBC", userKey);
                    aesCbcDecipher2.start({ iv: iv2, additionalData_: "binary-encoded string" });
                    aesCbcDecipher2.update(toDecrypt2);
                    aesCbcDecipher2.finish();
                    const contentKey = aesCbcDecipher2.output.bytes();
                    this.AddToInternal("lcp_content_key", contentKey);
                    return contentKey;
                }
            }
            catch (err) {
                console.log("LCP error! " + err);
            }
        }
        return undefined;
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
        if (!this.Internal) {
            this.Internal = Array();
        }
        const internal = { Name: key, Value: value };
        this.Internal.push(internal);
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
                if (link.Rel) {
                    const rr = link.Rel.find((r) => {
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
            const ll = this.Spine.find((link) => {
                if (link.Rel) {
                    const rr = link.Rel.find((r) => {
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
            const ll = this.Links.find((link) => {
                if (link.Rel) {
                    const rr = link.Rel.find((r) => {
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
    }
    AddLink(typeLink, rel, url, templated) {
        const link = new publication_link_1.Link();
        link.Rel = rel;
        link.Href = url;
        link.TypeLink = typeLink;
        link.Templated = templated;
        if (!this.Links) {
            this.Links = Array();
        }
        this.Links.push(link);
    }
    FindAllMediaOverlay() {
        const mos = Array();
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
        const mos = Array();
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
        const links = Array();
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
        if (!this.Spine) {
            console.log("Publication.Spine is not set!");
        }
    }
};
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