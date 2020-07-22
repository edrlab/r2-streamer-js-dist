"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const moment = require("moment");
const serializable_1 = require("r2-lcp-js/dist/es8-es2017/src/serializable");
const init_globals_1 = require("r2-opds-js/dist/es8-es2017/src/opds/init-globals");
const opds2_1 = require("r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2");
const opds2_link_1 = require("r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-link");
const opds2_metadata_1 = require("r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-metadata");
const opds2_publication_1 = require("r2-opds-js/dist/es8-es2017/src/opds/opds2/opds2-publication");
const init_globals_2 = require("r2-shared-js/dist/es8-es2017/src/init-globals");
const metadata_1 = require("r2-shared-js/dist/es8-es2017/src/models/metadata");
const publication_parser_1 = require("r2-shared-js/dist/es8-es2017/src/parser/publication-parser");
const UrlUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/http/UrlUtils");
init_globals_1.initGlobalConverters_OPDS();
init_globals_2.initGlobalConverters_SHARED();
init_globals_2.initGlobalConverters_GENERIC();
console.log(`process.cwd(): ${process.cwd()}`);
console.log(`__dirname: ${__dirname}`);
let args = process.argv.slice(2);
if (!args.length) {
    console.log("FILEPATH ARGUMENTS ARE MISSING.");
    process.exit(1);
}
const opdsJsonFilePath = args[0];
args = args.slice(1);
if (fs.existsSync(opdsJsonFilePath)) {
    console.log("OPDS2 JSON file already exists.");
    process.exit(1);
}
(async () => {
    const feed = new opds2_1.OPDSFeed();
    feed.Metadata = new opds2_metadata_1.OPDSMetadata();
    feed.Metadata.RDFType = "http://schema.org/DataFeed";
    feed.Metadata.Title = "Readium 2 OPDS 2.0 Feed";
    feed.Metadata.Modified = moment(Date.now()).toDate();
    feed.Publications = [];
    let nPubs = 0;
    for (const pathBase64 of args) {
        const pathBase64Str = Buffer.from(decodeURIComponent(pathBase64), "base64").toString("utf8");
        if (UrlUtils_1.isHTTP(pathBase64Str)) {
            continue;
        }
        console.log(`OPDS parsing: ${pathBase64Str}`);
        let publication;
        try {
            publication = await publication_parser_1.PublicationParsePromise(pathBase64Str);
        }
        catch (err) {
            console.log(err);
            continue;
        }
        nPubs++;
        const publi = new opds2_publication_1.OPDSPublication();
        publi.Links = [];
        const linkSelf = new opds2_link_1.OPDSLink();
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
        const coverLink = publication.GetCover();
        if (coverLink) {
            const linkCover = new opds2_link_1.OPDSLink();
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
                const publicationMetadataJson = serializable_1.TaJsonSerialize(publication.Metadata);
                publi.Metadata = serializable_1.TaJsonDeserialize(publicationMetadataJson, metadata_1.Metadata);
            }
            catch (err) {
                console.log(err);
                continue;
            }
        }
    }
    feed.Metadata.NumberOfItems = nPubs;
    const jsonObj = serializable_1.TaJsonSerialize(feed);
    const jsonStr = global.JSON.stringify(jsonObj, null, "");
    fs.writeFileSync(opdsJsonFilePath, jsonStr, { encoding: "utf8" });
    console.log("DONE! :)");
    console.log(opdsJsonFilePath);
})();
//# sourceMappingURL=opds2-create-cli.js.map