"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const opds2_1 = require("../opds/opds2/opds2");
const opds2_contributor_1 = require("../opds/opds2/opds2-contributor");
const opds2_link_1 = require("../opds/opds2/opds2-link");
const opds2_metadata_1 = require("../opds/opds2/opds2-metadata");
const opds2_publication_1 = require("../opds/opds2/opds2-publication");
const opds2_publicationMetadata_1 = require("../opds/opds2/opds2-publicationMetadata");
const publication_parser_1 = require("../parser/publication-parser");
const UrlUtils_1 = require("../_utils/http/UrlUtils");
const debug_ = require("debug");
const moment = require("moment");
const ta_json_1 = require("ta-json");
const debug = debug_("r2:opds2create");
debug(`process.cwd(): ${process.cwd()}`);
debug(`__dirname: ${__dirname}`);
let args = process.argv.slice(2);
if (!args.length) {
    debug("FILEPATH ARGUMENTS ARE MISSING.");
    process.exit(1);
}
const opdsJsonFilePath = args[0];
args = args.slice(1);
if (fs.existsSync(opdsJsonFilePath)) {
    debug("OPDS2 JSON file already exists.");
    process.exit(1);
}
(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const feed = new opds2_1.OPDSFeed();
    feed.Context = ["http://opds-spec.org/opds.jsonld"];
    feed.Metadata = new opds2_metadata_1.OPDSMetadata();
    feed.Metadata.RDFType = "http://schema.org/DataFeed";
    feed.Metadata.Title = "Readium 2 OPDS 2.0 Feed";
    feed.Metadata.Modified = moment(Date.now()).toDate();
    feed.Publications = [];
    let nPubs = 0;
    for (const pathBase64 of args) {
        const pathBase64Str = new Buffer(pathBase64, "base64").toString("utf8");
        if (UrlUtils_1.isHTTP(pathBase64Str)) {
            continue;
        }
        debug(`OPDS parsing: ${pathBase64Str}`);
        let publication;
        try {
            publication = yield publication_parser_1.PublicationParsePromise(pathBase64Str);
        }
        catch (err) {
            debug(err);
            continue;
        }
        nPubs++;
        const filePathBase64Encoded = UrlUtils_1.encodeURIComponent_RFC3986(pathBase64);
        const publi = new opds2_publication_1.OPDSPublication();
        publi.Links = [];
        const linkSelf = new opds2_link_1.OPDSLink();
        linkSelf.Href = filePathBase64Encoded + "/manifest.json";
        linkSelf.TypeLink = "application/webpub+json";
        linkSelf.AddRel("self");
        publi.Links.push(linkSelf);
        publi.Images = [];
        const coverLink = publication.GetCover();
        if (coverLink) {
            const linkCover = new opds2_link_1.OPDSLink();
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
                publication.Metadata.Artist.forEach((contributor) => {
                    const c = new opds2_contributor_1.OPDSContributor();
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
    }
    feed.Metadata.NumberOfItems = nPubs;
    const jsonObj = ta_json_1.JSON.serialize(feed);
    const jsonStr = global.JSON.stringify(jsonObj, null, "");
    fs.writeFileSync(opdsJsonFilePath, jsonStr, { encoding: "utf8" });
    debug("DONE! :)");
    debug(opdsJsonFilePath);
}))();
//# sourceMappingURL=opds2-create-cli.js.map