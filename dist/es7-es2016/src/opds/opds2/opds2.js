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
const ta_json_1 = require("ta-json");
const opds2_facet_1 = require("./opds2-facet");
const opds2_group_1 = require("./opds2-group");
const opds2_link_1 = require("./opds2-link");
const opds2_metadata_1 = require("./opds2-metadata");
const opds2_publication_1 = require("./opds2-publication");
let OPDSFeed = class OPDSFeed {
    findFirstLinkByRel(rel) {
        return this.Links ? this.Links.find((l) => {
            return l.HasRel(rel);
        }) : undefined;
    }
    AddLink(href, rel, typeLink, templated) {
        const l = new opds2_link_1.OPDSLink();
        l.Href = href;
        l.AddRel(rel);
        l.TypeLink = typeLink;
        if (templated) {
            l.Templated = true;
        }
        if (!this.Links) {
            this.Links = [];
        }
        this.Links.push(l);
    }
    AddNavigation(title, href, rel, typeLink) {
        const l = new opds2_link_1.OPDSLink();
        l.Href = href;
        l.TypeLink = typeLink;
        l.AddRel(rel);
        if (title) {
            l.Title = title;
        }
        if (!this.Navigation) {
            this.Navigation = [];
        }
        this.Navigation.push(l);
    }
    AddPagination(numberItems, itemsPerPage, currentPage, nextLink, prevLink, firstLink, lastLink) {
        if (!this.Metadata) {
            this.Metadata = new opds2_metadata_1.OPDSMetadata();
        }
        this.Metadata.CurrentPage = currentPage;
        this.Metadata.ItemsPerPage = itemsPerPage;
        this.Metadata.NumberOfItems = numberItems;
        if (nextLink) {
            this.AddLink(nextLink, "next", "application/opds+json", false);
        }
        if (prevLink) {
            this.AddLink(prevLink, "previous", "application/opds+json", false);
        }
        if (firstLink) {
            this.AddLink(firstLink, "first", "application/opds+json", false);
        }
        if (lastLink) {
            this.AddLink(lastLink, "last", "application/opds+json", false);
        }
    }
    AddFacet(link, group) {
        if (this.Facets) {
            const found = this.Facets.find((f) => {
                if (f.Metadata && f.Metadata.Title === group) {
                    if (!f.Links) {
                        f.Links = [];
                    }
                    f.Links.push(link);
                    return true;
                }
                return false;
            });
            if (found) {
                return;
            }
        }
        const facet = new opds2_facet_1.OPDSFacet();
        facet.Metadata = new opds2_metadata_1.OPDSMetadata();
        facet.Metadata.Title = group;
        facet.Links = [];
        facet.Links.push(link);
        if (!this.Facets) {
            this.Facets = [];
        }
        this.Facets.push(facet);
    }
    AddPublicationInGroup(publication, collLink) {
        if (this.Groups) {
            const found1 = this.Groups.find((g) => {
                if (g.Links) {
                    const found2 = g.Links.find((l) => {
                        if (l.Href === collLink.Href) {
                            if (!g.Publications) {
                                g.Publications = [];
                            }
                            g.Publications.push(publication);
                            return true;
                        }
                        return false;
                    });
                    if (found2) {
                        return true;
                    }
                }
                return false;
            });
            if (found1) {
                return;
            }
        }
        const group = new opds2_group_1.OPDSGroup();
        group.Metadata = new opds2_metadata_1.OPDSMetadata();
        group.Metadata.Title = collLink.Title;
        group.Publications = [];
        group.Publications.push(publication);
        const linkSelf = new opds2_link_1.OPDSLink();
        linkSelf.AddRel("self");
        linkSelf.Title = collLink.Title;
        linkSelf.Href = collLink.Href;
        group.Links = [];
        group.Links.push(linkSelf);
        if (!this.Groups) {
            this.Groups = [];
        }
        this.Groups.push(group);
    }
    AddNavigationInGroup(link, collLink) {
        if (this.Groups) {
            const found1 = this.Groups.find((g) => {
                if (g.Links) {
                    const found2 = g.Links.find((l) => {
                        if (l.Href === collLink.Href) {
                            if (!g.Navigation) {
                                g.Navigation = [];
                            }
                            g.Navigation.push(link);
                            return true;
                        }
                        return false;
                    });
                    if (found2) {
                        return true;
                    }
                }
                return false;
            });
            if (found1) {
                return;
            }
        }
        const group = new opds2_group_1.OPDSGroup();
        group.Metadata = new opds2_metadata_1.OPDSMetadata();
        group.Metadata.Title = collLink.Title;
        group.Navigation = [];
        group.Navigation.push(link);
        const linkSelf = new opds2_link_1.OPDSLink();
        linkSelf.AddRel("self");
        linkSelf.Title = collLink.Title;
        linkSelf.Href = collLink.Href;
        group.Links = [];
        group.Links.push(link);
        if (!this.Groups) {
            this.Groups = [];
        }
        this.Groups.push(group);
    }
    _OnDeserialized() {
        if (!this.Metadata) {
            console.log("OPDS2Feed.Metadata is not set!");
        }
        if (!this.Links) {
            console.log("OPDS2Feed.Links is not set!");
        }
        if (this.Context && this.Context instanceof Array && this.Context.length === 1) {
            this.Context = this.Context[0];
        }
    }
};
__decorate([
    ta_json_1.JsonProperty("@context"),
    ta_json_1.JsonElementType(String),
    __metadata("design:type", Object)
], OPDSFeed.prototype, "Context", void 0);
__decorate([
    ta_json_1.JsonProperty("metadata"),
    __metadata("design:type", opds2_metadata_1.OPDSMetadata)
], OPDSFeed.prototype, "Metadata", void 0);
__decorate([
    ta_json_1.JsonProperty("links"),
    ta_json_1.JsonElementType(opds2_link_1.OPDSLink),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Links", void 0);
__decorate([
    ta_json_1.JsonProperty("publications"),
    ta_json_1.JsonElementType(opds2_publication_1.OPDSPublication),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Publications", void 0);
__decorate([
    ta_json_1.JsonProperty("navigation"),
    ta_json_1.JsonElementType(opds2_link_1.OPDSLink),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Navigation", void 0);
__decorate([
    ta_json_1.JsonProperty("facets"),
    ta_json_1.JsonElementType(opds2_facet_1.OPDSFacet),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Facets", void 0);
__decorate([
    ta_json_1.JsonProperty("groups"),
    ta_json_1.JsonElementType(opds2_group_1.OPDSGroup),
    __metadata("design:type", Array)
], OPDSFeed.prototype, "Groups", void 0);
__decorate([
    ta_json_1.OnDeserialized(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OPDSFeed.prototype, "_OnDeserialized", null);
OPDSFeed = __decorate([
    ta_json_1.JsonObject()
], OPDSFeed);
exports.OPDSFeed = OPDSFeed;
//# sourceMappingURL=opds2.js.map