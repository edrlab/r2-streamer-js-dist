"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const querystring = require("querystring");
const media_overlay_1 = require("../models/media-overlay");
const metadata_1 = require("../models/metadata");
const metadata_belongsto_1 = require("../models/metadata-belongsto");
const metadata_collection_1 = require("../models/metadata-collection");
const metadata_contributor_1 = require("../models/metadata-contributor");
const metadata_encrypted_1 = require("../models/metadata-encrypted");
const metadata_properties_1 = require("../models/metadata-properties");
const metadata_subject_1 = require("../models/metadata-subject");
const publication_1 = require("../models/publication");
const publication_link_1 = require("../models/publication-link");
const BufferUtils_1 = require("../_utils/stream/BufferUtils");
const xml_js_mapper_1 = require("../_utils/xml-js-mapper");
const zipFactory_1 = require("../_utils/zip/zipFactory");
const sizeOf = require("image-size");
const moment = require("moment");
const ta_json_1 = require("ta-json");
const xmldom = require("xmldom");
const xpath = require("xpath");
const container_1 = require("./epub/container");
const encryption_1 = require("./epub/encryption");
const lcp_1 = require("./epub/lcp");
const ncx_1 = require("./epub/ncx");
const opf_1 = require("./epub/opf");
const opf_author_1 = require("./epub/opf-author");
const smil_1 = require("./epub/smil");
const smil_seq_1 = require("./epub/smil-seq");
const epub3 = "3.0";
const epub301 = "3.0.1";
const epub31 = "3.1";
const autoMeta = "auto";
const noneMeta = "none";
const reflowableMeta = "reflowable";
exports.mediaOverlayURLPath = "media-overlay.json";
exports.mediaOverlayURLParam = "resource";
exports.addCoverDimensions = async (publication, coverLink) => {
    if (publication.Internal) {
        const zipInternal = publication.Internal.find((i) => {
            if (i.Name === "zip") {
                return true;
            }
            return false;
        });
        if (zipInternal) {
            const zip = zipInternal.Value;
            if (zip.hasEntry(coverLink.Href)) {
                let zipStream;
                try {
                    zipStream = await zip.entryStreamPromise(coverLink.Href);
                    let zipData;
                    try {
                        zipData = await BufferUtils_1.streamToBufferPromise(zipStream.stream);
                        const imageInfo = sizeOf(zipData);
                        if (imageInfo) {
                            coverLink.Width = imageInfo.width;
                            coverLink.Height = imageInfo.height;
                            if (coverLink.TypeLink &&
                                coverLink.TypeLink.replace("jpeg", "jpg").replace("+xml", "")
                                    !== ("image/" + imageInfo.type)) {
                                console.log(`Wrong image type? ${coverLink.TypeLink} -- ${imageInfo.type}`);
                            }
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
    }
};
async function EpubParsePromise(filePath) {
    const zip = await zipFactory_1.zipLoadPromise(filePath);
    if (!zip.hasEntries()) {
        return Promise.reject("EPUB zip empty");
    }
    const publication = new publication_1.Publication();
    publication.Context = ["http://readium.org/webpub/default.jsonld"];
    publication.Metadata = new metadata_1.Metadata();
    publication.Metadata.RDFType = "http://schema.org/Book";
    publication.Metadata.Modified = moment(Date.now()).toDate();
    publication.AddToInternal("filename", path.basename(filePath));
    publication.AddToInternal("type", "epub");
    publication.AddToInternal("zip", zip);
    let lcpl;
    const lcplZipPath = "META-INF/license.lcpl";
    if (zip.hasEntry(lcplZipPath)) {
        const lcplZipStream_ = await zip.entryStreamPromise(lcplZipPath);
        const lcplZipStream = lcplZipStream_.stream;
        const lcplZipData = await BufferUtils_1.streamToBufferPromise(lcplZipStream);
        const lcplStr = lcplZipData.toString("utf8");
        const lcplJson = global.JSON.parse(lcplStr);
        lcpl = ta_json_1.JSON.deserialize(lcplJson, lcp_1.LCP);
        lcpl.ZipPath = lcplZipPath;
        publication.LCP = lcpl;
        publication.AddLink("application/vnd.readium.lcp.license-1.0+json", ["license"], lcpl.ZipPath, false);
    }
    let encryption;
    const encZipPath = "META-INF/encryption.xml";
    if (zip.hasEntry(encZipPath)) {
        const encryptionXmlZipStream_ = await zip.entryStreamPromise(encZipPath);
        const encryptionXmlZipStream = encryptionXmlZipStream_.stream;
        const encryptionXmlZipData = await BufferUtils_1.streamToBufferPromise(encryptionXmlZipStream);
        const encryptionXmlStr = encryptionXmlZipData.toString("utf8");
        const encryptionXmlDoc = new xmldom.DOMParser().parseFromString(encryptionXmlStr);
        encryption = xml_js_mapper_1.XML.deserialize(encryptionXmlDoc, encryption_1.Encryption);
        encryption.ZipPath = encZipPath;
    }
    const containerZipPath = "META-INF/container.xml";
    const containerXmlZipStream_ = await zip.entryStreamPromise(containerZipPath);
    const containerXmlZipStream = containerXmlZipStream_.stream;
    const containerXmlZipData = await BufferUtils_1.streamToBufferPromise(containerXmlZipStream);
    const containerXmlStr = containerXmlZipData.toString("utf8");
    const containerXmlDoc = new xmldom.DOMParser().parseFromString(containerXmlStr);
    const container = xml_js_mapper_1.XML.deserialize(containerXmlDoc, container_1.Container);
    container.ZipPath = containerZipPath;
    const rootfile = container.Rootfile[0];
    const opfZipStream_ = await zip.entryStreamPromise(rootfile.Path);
    const opfZipStream = opfZipStream_.stream;
    const opfZipData = await BufferUtils_1.streamToBufferPromise(opfZipStream);
    const opfStr = opfZipData.toString("utf8");
    const opfDoc = new xmldom.DOMParser().parseFromString(opfStr);
    const opf = xml_js_mapper_1.XML.deserialize(opfDoc, opf_1.OPF);
    opf.ZipPath = rootfile.Path;
    let ncx;
    if (opf.Spine.Toc) {
        const ncxManItem = opf.Manifest.find((manifestItem) => {
            return manifestItem.ID === opf.Spine.Toc;
        });
        if (ncxManItem) {
            const ncxFilePath = path.join(path.dirname(opf.ZipPath), ncxManItem.Href)
                .replace(/\\/g, "/");
            const ncxZipStream_ = await zip.entryStreamPromise(ncxFilePath);
            const ncxZipStream = ncxZipStream_.stream;
            const ncxZipData = await BufferUtils_1.streamToBufferPromise(ncxZipStream);
            const ncxStr = ncxZipData.toString("utf8");
            const ncxDoc = new xmldom.DOMParser().parseFromString(ncxStr);
            ncx = xml_js_mapper_1.XML.deserialize(ncxDoc, ncx_1.NCX);
            ncx.ZipPath = ncxFilePath;
        }
    }
    addTitle(publication, rootfile, opf);
    addIdentifier(publication, rootfile, opf);
    if (opf.Metadata) {
        if (opf.Metadata.Language) {
            publication.Metadata.Language = opf.Metadata.Language;
        }
        if (opf.Metadata.Rights && opf.Metadata.Rights.length) {
            publication.Metadata.Rights = opf.Metadata.Rights.join(" ");
        }
        if (opf.Metadata.Description && opf.Metadata.Description.length) {
            publication.Metadata.Description = opf.Metadata.Description[0];
        }
        if (opf.Metadata.Publisher && opf.Metadata.Publisher.length) {
            publication.Metadata.Publisher = [];
            opf.Metadata.Publisher.forEach((pub) => {
                const contrib = new metadata_contributor_1.Contributor();
                contrib.Name = pub;
                publication.Metadata.Publisher.push(contrib);
            });
        }
        if (opf.Metadata.Source && opf.Metadata.Source.length) {
            publication.Metadata.Source = opf.Metadata.Source[0];
        }
        if (opf.Metadata.Contributor && opf.Metadata.Contributor.length) {
            opf.Metadata.Contributor.forEach((cont) => {
                addContributor(publication, rootfile, opf, cont, undefined);
            });
        }
        if (opf.Metadata.Creator && opf.Metadata.Creator.length) {
            opf.Metadata.Creator.forEach((cont) => {
                addContributor(publication, rootfile, opf, cont, "aut");
            });
        }
    }
    if (opf.Spine && opf.Spine.PageProgression) {
        publication.Metadata.Direction = opf.Spine.PageProgression;
    }
    if (isEpub3OrMore(rootfile, opf)) {
        findContributorInMeta(publication, rootfile, opf);
    }
    await fillSpineAndResource(publication, rootfile, opf);
    addRendition(publication, rootfile, opf);
    await addCoverRel(publication, rootfile, opf);
    if (encryption) {
        fillEncryptionInfo(publication, rootfile, opf, encryption, lcpl);
    }
    await fillTOCFromNavDoc(publication, rootfile, opf, zip);
    if (!publication.TOC || !publication.TOC.length) {
        if (ncx) {
            fillTOCFromNCX(publication, rootfile, opf, ncx);
            fillPageListFromNCX(publication, rootfile, opf, ncx);
        }
        fillLandmarksFromGuide(publication, rootfile, opf);
    }
    fillCalibreSerieInfo(publication, rootfile, opf);
    fillSubject(publication, rootfile, opf);
    fillPublicationDate(publication, rootfile, opf);
    await fillMediaOverlay(publication, rootfile, opf, zip);
    return publication;
}
exports.EpubParsePromise = EpubParsePromise;
const fillMediaOverlay = async (publication, rootfile, opf, zip) => {
    if (!publication.Resources) {
        return;
    }
    for (const item of publication.Resources) {
        if (item.TypeLink !== "application/smil+xml") {
            continue;
        }
        const smilFilePath = item.Href;
        if (!zip.hasEntry(smilFilePath)) {
            continue;
        }
        if (item.Properties && item.Properties.Encrypted) {
            console.log("ENCRYPTED SMIL MEDIA OVERLAY: " + smilFilePath);
            continue;
        }
        const mo = new media_overlay_1.MediaOverlayNode();
        mo.SmilPathInZip = smilFilePath;
        const manItemsHtmlWithSmil = [];
        opf.Manifest.forEach((manItemHtmlWithSmil) => {
            if (manItemHtmlWithSmil.MediaOverlay) {
                const manItemSmil = opf.Manifest.find((mi) => {
                    if (mi.ID === manItemHtmlWithSmil.MediaOverlay) {
                        return true;
                    }
                    return false;
                });
                if (manItemSmil) {
                    const smilFilePath2 = path.join(path.dirname(opf.ZipPath), manItemSmil.Href)
                        .replace(/\\/g, "/");
                    if (smilFilePath2 === smilFilePath) {
                        manItemsHtmlWithSmil.push(manItemHtmlWithSmil);
                    }
                }
            }
        });
        manItemsHtmlWithSmil.forEach((manItemHtmlWithSmil) => {
            const htmlPathInZip = path.join(path.dirname(opf.ZipPath), manItemHtmlWithSmil.Href)
                .replace(/\\/g, "/");
            const link = findLinKByHref(publication, rootfile, opf, htmlPathInZip);
            if (link) {
                if (!link.MediaOverlays) {
                    link.MediaOverlays = [];
                }
                const alreadyExists = link.MediaOverlays.find((moo) => {
                    if (mo.SmilPathInZip === moo.SmilPathInZip) {
                        return true;
                    }
                    return false;
                });
                if (!alreadyExists) {
                    link.MediaOverlays.push(mo);
                }
                if (!link.Properties) {
                    link.Properties = new metadata_properties_1.Properties();
                }
                link.Properties.MediaOverlay = exports.mediaOverlayURLPath + "?" +
                    exports.mediaOverlayURLParam + "=" + querystring.escape(link.Href);
            }
        });
        const smilZipStream_ = await zip.entryStreamPromise(smilFilePath);
        const smilZipStream = smilZipStream_.stream;
        const smilZipData = await BufferUtils_1.streamToBufferPromise(smilZipStream);
        const smilStr = smilZipData.toString("utf8");
        const smilXmlDoc = new xmldom.DOMParser().parseFromString(smilStr);
        const smil = xml_js_mapper_1.XML.deserialize(smilXmlDoc, smil_1.SMIL);
        smil.ZipPath = smilFilePath;
        mo.Role = [];
        mo.Role.push("section");
        if (smil.Body) {
            if (smil.Body.TextRef) {
                const zipPath = path.join(path.dirname(smil.ZipPath), smil.Body.TextRef)
                    .replace(/\\/g, "/");
                mo.Text = zipPath;
            }
            if (smil.Body.Children && smil.Body.Children.length) {
                smil.Body.Children.forEach((seqChild) => {
                    if (!mo.Children) {
                        mo.Children = [];
                    }
                    addSeqToMediaOverlay(smil, publication, rootfile, opf, mo, mo.Children, seqChild);
                });
            }
        }
    }
    return;
};
const addSeqToMediaOverlay = (smil, publication, rootfile, opf, rootMO, mo, seqChild) => {
    const moc = new media_overlay_1.MediaOverlayNode();
    mo.push(moc);
    if (seqChild instanceof smil_seq_1.Seq) {
        moc.Role = [];
        moc.Role.push("section");
        const seq = seqChild;
        if (seq.TextRef) {
            const zipPath = path.join(path.dirname(smil.ZipPath), seq.TextRef)
                .replace(/\\/g, "/");
            moc.Text = zipPath;
        }
        if (seq.Children && seq.Children.length) {
            seq.Children.forEach((child) => {
                if (!moc.Children) {
                    moc.Children = [];
                }
                addSeqToMediaOverlay(smil, publication, rootfile, opf, rootMO, moc.Children, child);
            });
        }
    }
    else {
        const par = seqChild;
        if (par.Text && par.Text.Src) {
            const zipPath = path.join(path.dirname(smil.ZipPath), par.Text.Src)
                .replace(/\\/g, "/");
            moc.Text = zipPath;
        }
        if (par.Audio && par.Audio.Src) {
            const zipPath = path.join(path.dirname(smil.ZipPath), par.Audio.Src)
                .replace(/\\/g, "/");
            moc.Audio = zipPath;
            moc.Audio += "#t=";
            moc.Audio += par.Audio.ClipBegin ? media_overlay_1.timeStrToSeconds(par.Audio.ClipBegin) : "0";
            if (par.Audio.ClipEnd) {
                moc.Audio += ",";
                moc.Audio += media_overlay_1.timeStrToSeconds(par.Audio.ClipEnd);
            }
        }
    }
};
const fillPublicationDate = (publication, rootfile, opf) => {
    if (opf.Metadata && opf.Metadata.Date && opf.Metadata.Date.length) {
        if (isEpub3OrMore(rootfile, opf) && opf.Metadata.Date[0] && opf.Metadata.Date[0].Data) {
            publication.Metadata.PublicationDate = moment(opf.Metadata.Date[0].Data).toDate();
            return;
        }
        opf.Metadata.Date.forEach((date) => {
            if (date.Data && date.Event && date.Event.indexOf("publication") >= 0) {
                publication.Metadata.PublicationDate = moment(date.Data).toDate();
            }
        });
    }
};
const findContributorInMeta = (publication, rootfile, opf) => {
    if (opf.Metadata && opf.Metadata.Meta) {
        opf.Metadata.Meta.forEach((meta) => {
            if (meta.Property === "dcterms:creator" || meta.Property === "dcterms:contributor") {
                const cont = new opf_author_1.Author();
                cont.Data = meta.Data;
                cont.ID = meta.ID;
                addContributor(publication, rootfile, opf, cont, undefined);
            }
        });
    }
};
const addContributor = (publication, rootfile, opf, cont, forcedRole) => {
    const contributor = new metadata_contributor_1.Contributor();
    let role;
    if (isEpub3OrMore(rootfile, opf)) {
        const meta = findMetaByRefineAndProperty(rootfile, opf, cont.ID, "role");
        if (meta && meta.Property === "role") {
            role = meta.Data;
        }
        if (!role && forcedRole) {
            role = forcedRole;
        }
        const metaAlt = findAllMetaByRefineAndProperty(rootfile, opf, cont.ID, "alternate-script");
        if (metaAlt && metaAlt.length) {
            contributor.Name = {};
            if (publication.Metadata &&
                publication.Metadata.Language &&
                publication.Metadata.Language.length) {
                contributor.Name[publication.Metadata.Language[0].toLowerCase()] = cont.Data;
            }
            metaAlt.forEach((m) => {
                if (m.Lang) {
                    contributor.Name[m.Lang] = m.Data;
                }
            });
        }
        else {
            contributor.Name = cont.Data;
        }
    }
    else {
        contributor.Name = cont.Data;
        role = cont.Role;
        if (!role && forcedRole) {
            role = forcedRole;
        }
    }
    if (role) {
        switch (role) {
            case "aut": {
                if (!publication.Metadata.Author) {
                    publication.Metadata.Author = [];
                }
                publication.Metadata.Author.push(contributor);
                break;
            }
            case "trl": {
                if (!publication.Metadata.Translator) {
                    publication.Metadata.Translator = [];
                }
                publication.Metadata.Translator.push(contributor);
                break;
            }
            case "art": {
                if (!publication.Metadata.Artist) {
                    publication.Metadata.Artist = [];
                }
                publication.Metadata.Artist.push(contributor);
                break;
            }
            case "edt": {
                if (!publication.Metadata.Editor) {
                    publication.Metadata.Editor = [];
                }
                publication.Metadata.Editor.push(contributor);
                break;
            }
            case "ill": {
                if (!publication.Metadata.Illustrator) {
                    publication.Metadata.Illustrator = [];
                }
                publication.Metadata.Illustrator.push(contributor);
                break;
            }
            case "ltr": {
                if (!publication.Metadata.Letterer) {
                    publication.Metadata.Letterer = [];
                }
                publication.Metadata.Letterer.push(contributor);
                break;
            }
            case "pen": {
                if (!publication.Metadata.Penciler) {
                    publication.Metadata.Penciler = [];
                }
                publication.Metadata.Penciler.push(contributor);
                break;
            }
            case "clr": {
                if (!publication.Metadata.Colorist) {
                    publication.Metadata.Colorist = [];
                }
                publication.Metadata.Colorist.push(contributor);
                break;
            }
            case "ink": {
                if (!publication.Metadata.Inker) {
                    publication.Metadata.Inker = [];
                }
                publication.Metadata.Inker.push(contributor);
                break;
            }
            case "nrt": {
                if (!publication.Metadata.Narrator) {
                    publication.Metadata.Narrator = [];
                }
                publication.Metadata.Narrator.push(contributor);
                break;
            }
            case "pbl": {
                if (!publication.Metadata.Publisher) {
                    publication.Metadata.Publisher = [];
                }
                publication.Metadata.Publisher.push(contributor);
                break;
            }
            default: {
                contributor.Role = role;
                if (!publication.Metadata.Contributor) {
                    publication.Metadata.Contributor = [];
                }
                publication.Metadata.Contributor.push(contributor);
            }
        }
    }
};
const addIdentifier = (publication, _rootfile, opf) => {
    if (opf.Metadata && opf.Metadata.Identifier) {
        if (opf.UniqueIdentifier && opf.Metadata.Identifier.length > 1) {
            opf.Metadata.Identifier.forEach((iden) => {
                if (iden.ID === opf.UniqueIdentifier) {
                    publication.Metadata.Identifier = iden.Data;
                }
            });
        }
        else if (opf.Metadata.Identifier.length > 0) {
            publication.Metadata.Identifier = opf.Metadata.Identifier[0].Data;
        }
    }
};
const addTitle = (publication, rootfile, opf) => {
    if (isEpub3OrMore(rootfile, opf)) {
        let mainTitle;
        if (opf.Metadata &&
            opf.Metadata.Title &&
            opf.Metadata.Title.length) {
            if (opf.Metadata.Meta) {
                const tt = opf.Metadata.Title.find((title) => {
                    const refineID = "#" + title.ID;
                    const m = opf.Metadata.Meta.find((meta) => {
                        if (meta.Data === "main" && meta.Refine === refineID) {
                            return true;
                        }
                        return false;
                    });
                    if (m) {
                        return true;
                    }
                    return false;
                });
                if (tt) {
                    mainTitle = tt;
                }
            }
            if (!mainTitle) {
                mainTitle = opf.Metadata.Title[0];
            }
        }
        if (mainTitle) {
            const metaAlt = findAllMetaByRefineAndProperty(rootfile, opf, mainTitle.ID, "alternate-script");
            if (metaAlt && metaAlt.length) {
                publication.Metadata.Title = {};
                if (mainTitle.Lang) {
                    publication.Metadata.Title[mainTitle.Lang.toLowerCase()] = mainTitle.Data;
                }
                metaAlt.forEach((m) => {
                    if (m.Lang) {
                        publication.Metadata.Title[m.Lang.toLowerCase()] = m.Data;
                    }
                });
            }
            else {
                publication.Metadata.Title = mainTitle.Data;
            }
        }
    }
    else {
        if (opf.Metadata &&
            opf.Metadata.Title &&
            opf.Metadata.Title.length) {
            publication.Metadata.Title = opf.Metadata.Title[0].Data;
        }
    }
};
const addRelAndPropertiesToLink = async (publication, link, linkEpub, rootfile, opf) => {
    if (linkEpub.Properties) {
        await addToLinkFromProperties(publication, link, linkEpub.Properties);
    }
    const spineProperties = findPropertiesInSpineForManifest(linkEpub, rootfile, opf);
    if (spineProperties) {
        await addToLinkFromProperties(publication, link, spineProperties);
    }
};
const addToLinkFromProperties = async (publication, link, propertiesString) => {
    const properties = propertiesString.split(" ");
    const propertiesStruct = new metadata_properties_1.Properties();
    for (const p of properties) {
        switch (p) {
            case "cover-image": {
                link.AddRel("cover");
                await exports.addCoverDimensions(publication, link);
                break;
            }
            case "nav": {
                link.AddRel("contents");
                break;
            }
            case "scripted": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("js");
                break;
            }
            case "mathml": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("mathml");
                break;
            }
            case "onix-record": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("onix");
                break;
            }
            case "svg": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("svg");
                break;
            }
            case "xmp-record": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("xmp");
                break;
            }
            case "remote-resources": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("remote-resources");
                break;
            }
            case "page-spread-left": {
                propertiesStruct.Page = "left";
                break;
            }
            case "page-spread-right": {
                propertiesStruct.Page = "right";
                break;
            }
            case "page-spread-center": {
                propertiesStruct.Page = "center";
                break;
            }
            case "rendition:spread-none": {
                propertiesStruct.Spread = noneMeta;
                break;
            }
            case "rendition:spread-auto": {
                propertiesStruct.Spread = autoMeta;
                break;
            }
            case "rendition:spread-landscape": {
                propertiesStruct.Spread = "landscape";
                break;
            }
            case "rendition:spread-portrait": {
                propertiesStruct.Spread = "portrait";
                break;
            }
            case "rendition:spread-both": {
                propertiesStruct.Spread = "both";
                break;
            }
            case "rendition:layout-reflowable": {
                propertiesStruct.Layout = reflowableMeta;
                break;
            }
            case "rendition:layout-pre-paginated": {
                propertiesStruct.Layout = "fixed";
                break;
            }
            case "rendition:orientation-auto": {
                propertiesStruct.Orientation = "auto";
                break;
            }
            case "rendition:orientation-landscape": {
                propertiesStruct.Orientation = "landscape";
                break;
            }
            case "rendition:orientation-portrait": {
                propertiesStruct.Orientation = "portrait";
                break;
            }
            case "rendition:flow-auto": {
                propertiesStruct.Overflow = autoMeta;
                break;
            }
            case "rendition:flow-paginated": {
                propertiesStruct.Overflow = "paginated";
                break;
            }
            case "rendition:flow-scrolled-continuous": {
                propertiesStruct.Overflow = "scrolled-continuous";
                break;
            }
            case "rendition:flow-scrolled-doc": {
                propertiesStruct.Overflow = "scrolled";
                break;
            }
            default: {
                break;
            }
        }
        if (propertiesStruct.Layout ||
            propertiesStruct.Orientation ||
            propertiesStruct.Overflow ||
            propertiesStruct.Page ||
            propertiesStruct.Spread ||
            (propertiesStruct.Contains && propertiesStruct.Contains.length)) {
            link.Properties = propertiesStruct;
        }
    }
};
const addMediaOverlay = (link, linkEpub, rootfile, opf) => {
    if (linkEpub.MediaOverlay) {
        const meta = findMetaByRefineAndProperty(rootfile, opf, linkEpub.MediaOverlay, "media:duration");
        if (meta) {
            link.Duration = media_overlay_1.timeStrToSeconds(meta.Data);
        }
    }
};
const findInManifestByID = async (publication, rootfile, opf, ID) => {
    if (opf.Manifest && opf.Manifest.length) {
        const item = opf.Manifest.find((manItem) => {
            if (manItem.ID === ID) {
                return true;
            }
            return false;
        });
        if (item) {
            const linkItem = new publication_link_1.Link();
            linkItem.TypeLink = item.MediaType;
            const zipPath = path.join(path.dirname(opf.ZipPath), item.Href)
                .replace(/\\/g, "/");
            linkItem.Href = zipPath;
            await addRelAndPropertiesToLink(publication, linkItem, item, rootfile, opf);
            addMediaOverlay(linkItem, item, rootfile, opf);
            return linkItem;
        }
    }
    return Promise.reject(`${ID} not found`);
};
const addRendition = (publication, _rootfile, opf) => {
    if (opf.Metadata && opf.Metadata.Meta && opf.Metadata.Meta.length) {
        const rendition = new metadata_properties_1.Properties();
        opf.Metadata.Meta.forEach((meta) => {
            switch (meta.Property) {
                case "rendition:layout": {
                    if (meta.Data === "pre-paginated") {
                        rendition.Layout = "fixed";
                    }
                    else if (meta.Data === "reflowable") {
                        rendition.Layout = "reflowable";
                    }
                    break;
                }
                case "rendition:orientation": {
                    rendition.Orientation = meta.Data;
                    break;
                }
                case "rendition:spread": {
                    rendition.Spread = meta.Data;
                    break;
                }
                case "rendition:flow": {
                    rendition.Overflow = meta.Data;
                    break;
                }
                default: {
                    break;
                }
            }
        });
        if (rendition.Layout || rendition.Orientation || rendition.Overflow || rendition.Page || rendition.Spread) {
            publication.Metadata.Rendition = rendition;
        }
    }
};
const fillSpineAndResource = async (publication, rootfile, opf) => {
    if (opf.Spine && opf.Spine.Items && opf.Spine.Items.length) {
        for (const item of opf.Spine.Items) {
            if (!item.Linear || item.Linear === "yes") {
                let linkItem;
                try {
                    linkItem = await findInManifestByID(publication, rootfile, opf, item.IDref);
                }
                catch (err) {
                    console.log(err);
                }
                if (linkItem && linkItem.Href) {
                    if (!publication.Spine) {
                        publication.Spine = [];
                    }
                    publication.Spine.push(linkItem);
                }
            }
        }
    }
    if (opf.Manifest && opf.Manifest.length) {
        for (const item of opf.Manifest) {
            const zipPath = path.join(path.dirname(opf.ZipPath), item.Href)
                .replace(/\\/g, "/");
            const linkSpine = findInSpineByHref(publication, zipPath);
            if (!linkSpine || !linkSpine.Href) {
                const linkItem = new publication_link_1.Link();
                linkItem.TypeLink = item.MediaType;
                linkItem.Href = zipPath;
                await addRelAndPropertiesToLink(publication, linkItem, item, rootfile, opf);
                addMediaOverlay(linkItem, item, rootfile, opf);
                if (!publication.Resources) {
                    publication.Resources = [];
                }
                publication.Resources.push(linkItem);
            }
        }
    }
};
const fillEncryptionInfo = (publication, _rootfile, _opf, encryption, lcp) => {
    encryption.EncryptedData.forEach((encInfo) => {
        const encrypted = new metadata_encrypted_1.Encrypted();
        encrypted.Algorithm = encInfo.EncryptionMethod.Algorithm;
        if (lcp) {
            encrypted.Profile = lcp.Encryption.Profile;
            encrypted.Scheme = "http://readium.org/2014/01/lcp";
        }
        if (encInfo.EncryptionProperties && encInfo.EncryptionProperties.length) {
            encInfo.EncryptionProperties.forEach((prop) => {
                if (prop.Compression) {
                    if (prop.Compression.OriginalLength) {
                        encrypted.OriginalLength = parseFloat(prop.Compression.OriginalLength);
                    }
                    if (prop.Compression.Method === "8") {
                        encrypted.Compression = "deflate";
                    }
                    else {
                        encrypted.Compression = "none";
                    }
                }
            });
        }
        publication.Resources.forEach((l, _i, _arr) => {
            const filePath = l.Href;
            if (filePath === encInfo.CipherData.CipherReference.URI) {
                if (!l.Properties) {
                    l.Properties = new metadata_properties_1.Properties();
                }
                l.Properties.Encrypted = encrypted;
            }
        });
        publication.Spine.forEach((l, _i, _arr) => {
            const filePath = l.Href;
            if (filePath === encInfo.CipherData.CipherReference.URI) {
                if (!l.Properties) {
                    l.Properties = new metadata_properties_1.Properties();
                }
                l.Properties.Encrypted = encrypted;
            }
        });
    });
};
const fillPageListFromNCX = (publication, _rootfile, _opf, ncx) => {
    if (ncx.PageList && ncx.PageList.PageTarget && ncx.PageList.PageTarget.length) {
        ncx.PageList.PageTarget.forEach((pageTarget) => {
            const link = new publication_link_1.Link();
            const zipPath = path.join(path.dirname(ncx.ZipPath), pageTarget.Content.Src)
                .replace(/\\/g, "/");
            link.Href = zipPath;
            link.Title = pageTarget.Text;
            if (!publication.PageList) {
                publication.PageList = [];
            }
            publication.PageList.push(link);
        });
    }
};
const fillTOCFromNCX = (publication, rootfile, opf, ncx) => {
    if (ncx.Points && ncx.Points.length) {
        ncx.Points.forEach((point) => {
            if (!publication.TOC) {
                publication.TOC = [];
            }
            fillTOCFromNavPoint(publication, rootfile, opf, ncx, point, publication.TOC);
        });
    }
};
const fillLandmarksFromGuide = (publication, _rootfile, opf) => {
    if (opf.Guide && opf.Guide.length) {
        opf.Guide.forEach((ref) => {
            if (ref.Href) {
                const link = new publication_link_1.Link();
                const zipPath = path.join(path.dirname(opf.ZipPath), ref.Href)
                    .replace(/\\/g, "/");
                link.Href = zipPath;
                link.Title = ref.Title;
                if (!publication.Landmarks) {
                    publication.Landmarks = [];
                }
                publication.Landmarks.push(link);
            }
        });
    }
};
const fillTOCFromNavPoint = (publication, rootfile, opf, ncx, point, node) => {
    const link = new publication_link_1.Link();
    const zipPath = path.join(path.dirname(ncx.ZipPath), point.Content.Src)
        .replace(/\\/g, "/");
    link.Href = zipPath;
    link.Title = point.Text;
    if (point.Points && point.Points.length) {
        point.Points.forEach((p) => {
            if (!link.Children) {
                link.Children = [];
            }
            fillTOCFromNavPoint(publication, rootfile, opf, ncx, p, link.Children);
        });
    }
    node.push(link);
};
const fillSubject = (publication, _rootfile, opf) => {
    if (opf.Metadata && opf.Metadata.Subject && opf.Metadata.Subject.length) {
        opf.Metadata.Subject.forEach((s) => {
            const sub = new metadata_subject_1.Subject();
            sub.Name = s.Data;
            sub.Code = s.Term;
            sub.Scheme = s.Authority;
            if (!publication.Metadata.Subject) {
                publication.Metadata.Subject = [];
            }
            publication.Metadata.Subject.push(sub);
        });
    }
};
const fillCalibreSerieInfo = (publication, _rootfile, opf) => {
    let serie;
    let seriePosition;
    if (opf.Metadata && opf.Metadata.Meta && opf.Metadata.Meta.length) {
        opf.Metadata.Meta.forEach((m) => {
            if (m.Name === "calibre:series") {
                serie = m.Content;
            }
            if (m.Name === "calibre:series_index") {
                seriePosition = parseFloat(m.Content);
            }
        });
    }
    if (serie) {
        const collection = new metadata_collection_1.Collection();
        collection.Name = serie;
        if (seriePosition) {
            collection.Position = seriePosition;
        }
        if (!publication.Metadata.BelongsTo) {
            publication.Metadata.BelongsTo = new metadata_belongsto_1.BelongsTo();
        }
        if (!publication.Metadata.BelongsTo.Series) {
            publication.Metadata.BelongsTo.Series = [];
        }
        publication.Metadata.BelongsTo.Series.push(collection);
    }
};
const fillTOCFromNavDoc = async (publication, _rootfile, _opf, zip) => {
    const navLink = publication.GetNavDoc();
    if (!navLink) {
        return;
    }
    const navDocFilePath = navLink.Href;
    if (!zip.hasEntry(navDocFilePath)) {
        return;
    }
    const navDocZipStream_ = await zip.entryStreamPromise(navDocFilePath);
    const navDocZipStream = navDocZipStream_.stream;
    const navDocZipData = await BufferUtils_1.streamToBufferPromise(navDocZipStream);
    const navDocStr = navDocZipData.toString("utf8");
    const navXmlDoc = new xmldom.DOMParser().parseFromString(navDocStr);
    const select = xpath.useNamespaces({
        epub: "http://www.idpf.org/2007/ops",
        xhtml: "http://www.w3.org/1999/xhtml",
    });
    const navs = select("/xhtml:html/xhtml:body//xhtml:nav", navXmlDoc);
    if (navs && navs.length) {
        navs.forEach((navElement) => {
            const typeNav = select("@epub:type", navElement);
            if (typeNav && typeNav.length) {
                const olElem = select("xhtml:ol", navElement);
                switch (typeNav[0].value) {
                    case "toc": {
                        publication.TOC = [];
                        fillTOCFromNavDocWithOL(select, olElem, publication.TOC, navLink.Href);
                        break;
                    }
                    case "page-list": {
                        publication.PageList = [];
                        fillTOCFromNavDocWithOL(select, olElem, publication.PageList, navLink.Href);
                        break;
                    }
                    case "landmarks": {
                        publication.Landmarks = [];
                        fillTOCFromNavDocWithOL(select, olElem, publication.Landmarks, navLink.Href);
                        break;
                    }
                    case "lot": {
                        publication.LOT = [];
                        fillTOCFromNavDocWithOL(select, olElem, publication.LOT, navLink.Href);
                        break;
                    }
                    case "loa": {
                        publication.LOA = [];
                        fillTOCFromNavDocWithOL(select, olElem, publication.LOA, navLink.Href);
                        break;
                    }
                    case "loi": {
                        publication.LOI = [];
                        fillTOCFromNavDocWithOL(select, olElem, publication.LOI, navLink.Href);
                        break;
                    }
                    case "lov": {
                        publication.LOV = [];
                        fillTOCFromNavDocWithOL(select, olElem, publication.LOV, navLink.Href);
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        });
    }
};
const fillTOCFromNavDocWithOL = (select, olElems, node, navDocPath) => {
    olElems.forEach((olElem) => {
        const liElems = select("xhtml:li", olElem);
        if (liElems && liElems.length) {
            liElems.forEach((liElem) => {
                const link = new publication_link_1.Link();
                node.push(link);
                const aElems = select("xhtml:a", liElem);
                if (aElems && aElems.length > 0) {
                    let aHref = select("@href", aElems[0]);
                    if (aHref && aHref.length) {
                        if (aHref[0][0] === "#") {
                            aHref = navDocPath + aHref[0];
                        }
                        const zipPath = path.join(path.dirname(navDocPath), aHref[0].value)
                            .replace(/\\/g, "/");
                        link.Href = zipPath;
                    }
                    let aText = aElems[0].textContent;
                    if (aText && aText.length) {
                        aText = aText.trim();
                        aText = aText.replace(/\s\s+/g, " ");
                        link.Title = aText;
                    }
                }
                const olElemsNext = select("xhtml:ol", liElem);
                if (olElemsNext && olElemsNext.length) {
                    if (!link.Children) {
                        link.Children = [];
                    }
                    fillTOCFromNavDocWithOL(select, olElemsNext, link.Children, navDocPath);
                }
            });
        }
    });
};
const addCoverRel = async (publication, rootfile, opf) => {
    let coverID;
    if (opf.Metadata && opf.Metadata.Meta && opf.Metadata.Meta.length) {
        opf.Metadata.Meta.find((meta) => {
            if (meta.Name === "cover") {
                coverID = meta.Content;
                return true;
            }
            return false;
        });
    }
    if (coverID) {
        let manifestInfo;
        try {
            manifestInfo = await findInManifestByID(publication, rootfile, opf, coverID);
        }
        catch (err) {
            console.log(err);
        }
        if (manifestInfo && manifestInfo.Href && publication.Resources && publication.Resources.length) {
            const href = manifestInfo.Href;
            const linky = publication.Resources.find((item, _i, _arr) => {
                if (item.Href === href) {
                    return true;
                }
                return false;
            });
            if (linky) {
                linky.AddRel("cover");
                await exports.addCoverDimensions(publication, linky);
            }
        }
    }
};
const findPropertiesInSpineForManifest = (linkEpub, _rootfile, opf) => {
    if (opf.Spine && opf.Spine.Items && opf.Spine.Items.length) {
        const it = opf.Spine.Items.find((item) => {
            if (item.IDref === linkEpub.ID) {
                return true;
            }
            return false;
        });
        if (it && it.Properties) {
            return it.Properties;
        }
    }
    return undefined;
};
const findInSpineByHref = (publication, href) => {
    if (publication.Spine && publication.Spine.length) {
        const ll = publication.Spine.find((l) => {
            if (l.Href === href) {
                return true;
            }
            return false;
        });
        if (ll) {
            return ll;
        }
    }
    return undefined;
};
const findMetaByRefineAndProperty = (rootfile, opf, ID, property) => {
    const ret = findAllMetaByRefineAndProperty(rootfile, opf, ID, property);
    if (ret.length) {
        return ret[0];
    }
    return undefined;
};
const findAllMetaByRefineAndProperty = (_rootfile, opf, ID, property) => {
    const metas = [];
    const refineID = "#" + ID;
    if (opf.Metadata && opf.Metadata.Meta) {
        opf.Metadata.Meta.forEach((metaTag) => {
            if (metaTag.Refine === refineID && metaTag.Property === property) {
                metas.push(metaTag);
            }
        });
    }
    return metas;
};
const getEpubVersion = (rootfile, opf) => {
    if (rootfile.Version) {
        return rootfile.Version;
    }
    else if (opf.Version) {
        return opf.Version;
    }
    return undefined;
};
const isEpub3OrMore = (rootfile, opf) => {
    const version = getEpubVersion(rootfile, opf);
    return (version === epub3 || version === epub301 || version === epub31);
};
const findLinKByHref = (publication, _rootfile, _opf, href) => {
    if (publication.Spine && publication.Spine.length) {
        const ll = publication.Spine.find((l) => {
            const pathInZip = l.Href;
            if (href === pathInZip) {
                return true;
            }
            return false;
        });
        if (ll) {
            return ll;
        }
    }
    return undefined;
};
//# sourceMappingURL=epub.js.map