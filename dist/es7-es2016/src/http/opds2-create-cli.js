"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const opds2_1 = require("r2-opds-js/dist/es7-es2016/src/opds/opds2/opds2");
const opds2_link_1 = require("r2-opds-js/dist/es7-es2016/src/opds/opds2/opds2-link");
const opds2_metadata_1 = require("r2-opds-js/dist/es7-es2016/src/opds/opds2/opds2-metadata");
const opds2_publication_1 = require("r2-opds-js/dist/es7-es2016/src/opds/opds2/opds2-publication");
const opds2_publicationMetadata_1 = require("r2-opds-js/dist/es7-es2016/src/opds/opds2/opds2-publicationMetadata");
const publication_parser_1 = require("r2-shared-js/dist/es7-es2016/src/parser/publication-parser");
const UrlUtils_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/http/UrlUtils");
const debug_ = require("debug");
const moment = require("moment");
const ta_json_x_1 = require("ta-json-x");
const debug = debug_("r2:streamer#http/opds2-create-cli");
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
        const pathBase64Str = new Buffer(decodeURIComponent(pathBase64), "base64").toString("utf8");
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
        linkSelf.AddRel("http://opds-spec.org/acquisition");
        publi.Links.push(linkSelf);
        feed.Publications.push(publi);
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
        if (publication.Metadata) {
            try {
                const publicationMetadataJson = ta_json_x_1.JSON.serialize(publication.Metadata);
                publi.Metadata = ta_json_x_1.JSON.deserialize(publicationMetadataJson, opds2_publicationMetadata_1.OPDSPublicationMetadata);
            }
            catch (err) {
                debug(err);
                continue;
            }
        }
    }
    feed.Metadata.NumberOfItems = nPubs;
    const jsonObj = ta_json_x_1.JSON.serialize(feed);
    const jsonStr = global.JSON.stringify(jsonObj, null, "");
    fs.writeFileSync(opdsJsonFilePath, jsonStr, { encoding: "utf8" });
    debug("DONE! :)");
    debug(opdsJsonFilePath);
}))();
//# sourceMappingURL=opds2-create-cli.js.map