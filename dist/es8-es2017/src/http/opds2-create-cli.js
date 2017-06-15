"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const cbz_1 = require("../parser/cbz");
const epub_1 = require("../parser/epub");
const UrlUtils_1 = require("../_utils/http/UrlUtils");
const debug_ = require("debug");
const moment = require("moment");
const ta_json_1 = require("ta-json");
const opds2_1 = require("../models/opds2/opds2");
const opds2_metadata_1 = require("../models/opds2/opds2-metadata");
const publication_1 = require("../models/publication");
const publication_link_1 = require("../models/publication-link");
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
(async () => {
    const publications = new opds2_1.OPDSFeed();
    publications.Context = ["http://opds-spec.org/opds.jsonld"];
    publications.Metadata = new opds2_metadata_1.OPDSMetadata();
    publications.Metadata.RDFType = "http://schema.org/DataFeed";
    publications.Metadata.Title = "Readium 2 OPDS 2.0 Feed";
    publications.Metadata.Modified = moment(Date.now()).toDate();
    publications.Publications = new Array();
    let nPubs = 0;
    for (const pathBase64 of args) {
        const pathBase64Str = new Buffer(pathBase64, "base64").toString("utf8");
        if (UrlUtils_1.isHTTP(pathBase64Str)) {
            continue;
        }
        const fileName = path.basename(pathBase64Str);
        const ext = path.extname(fileName).toLowerCase();
        debug(`OPDS parsing: ${pathBase64Str}`);
        let publication;
        try {
            publication = ext === ".epub" ?
                await epub_1.EpubParsePromise(pathBase64Str) :
                await cbz_1.CbzParsePromise(pathBase64Str);
        }
        catch (err) {
            debug(err);
            continue;
        }
        nPubs++;
        const filePathBase64Encoded = UrlUtils_1.encodeURIComponent_RFC3986(pathBase64);
        const publi = new publication_1.Publication();
        publi.Links = new Array();
        const linkSelf = new publication_link_1.Link();
        linkSelf.Href = filePathBase64Encoded + "/manifest.json";
        linkSelf.TypeLink = "application/webpub+json";
        linkSelf.Rel = new Array();
        linkSelf.Rel.push("self");
        publi.Links.push(linkSelf);
        publi.Images = new Array();
        const coverLink = publication.GetCover();
        if (coverLink) {
            const linkCover = new publication_link_1.Link();
            linkCover.Href = filePathBase64Encoded + "/" + coverLink.Href;
            linkCover.TypeLink = coverLink.TypeLink;
            if (coverLink.Width && coverLink.Height) {
                linkCover.Width = coverLink.Width;
                linkCover.Height = coverLink.Height;
            }
            publi.Images.push(linkCover);
        }
        if (publications.Metadata) {
            publi.Metadata = publication.Metadata;
        }
        publications.Publications.push(publi);
    }
    publications.Metadata.NumberOfItems = nPubs;
    const jsonObj = ta_json_1.JSON.serialize(publications);
    const jsonStr = global.JSON.stringify(jsonObj, null, "");
    fs.writeFileSync(opdsJsonFilePath, jsonStr, "utf8");
    debug("DONE! :)");
    debug(opdsJsonFilePath);
})();
//# sourceMappingURL=opds2-create-cli.js.map