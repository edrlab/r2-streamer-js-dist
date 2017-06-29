"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const media_overlay_1 = require("../src/models/media-overlay");
const metadata_1 = require("../src/models/metadata");
const metadata_contributor_1 = require("../src/models/metadata-contributor");
const publication_1 = require("../src/models/publication");
const publication_link_1 = require("../src/models/publication-link");
const opds2_1 = require("../src/opds/opds2/opds2");
const opds2_link_1 = require("../src/opds/opds2/opds2-link");
const opds2_publicationMetadata_1 = require("../src/opds/opds2/opds2-publicationMetadata");
const JsonUtils_1 = require("../src/_utils/JsonUtils");
const ava_1 = require("ava");
const debug_ = require("debug");
const ta_json_1 = require("ta-json");
const debug = debug_("r2:test");
function inspect(obj) {
    if (!process.env.DEBUG || process.env.DEBUG === "false" || process.env.DEBUG === "0") {
        return;
    }
    console.log(util.inspect(obj, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
}
function log(str) {
    if (!process.env.DEBUG || process.env.DEBUG === "false" || process.env.DEBUG === "0") {
        return;
    }
    console.log(str);
}
function logJSON(json) {
    if (!process.env.DEBUG || process.env.DEBUG === "false" || process.env.DEBUG === "0") {
        return;
    }
    const jsonStr = global.JSON.stringify(json, null, "");
    log(jsonStr);
}
function checkType(t, obj, clazz) {
    t.is(typeof obj, "object");
    t.true(obj instanceof clazz);
    t.is(obj.constructor, clazz);
}
function checkType_String(t, obj) {
    t.is(typeof obj, "string");
    t.false(obj instanceof String);
    t.false(obj instanceof Object);
    t.is(obj.constructor, String);
}
function checkType_Array(t, obj) {
    t.is(typeof obj, "object");
    t.true(obj instanceof Array);
    t.true(obj instanceof Object);
    t.is(obj.constructor, Array);
}
function checkType_Object(t, obj) {
    checkType(t, obj, Object);
}
async function fn() {
    return Promise.resolve("foo");
}
ava_1.test("dummy async test", async (t) => {
    debug("test ASYNC");
    t.is(await fn(), "foo");
});
ava_1.test("SMIL clock values", (t) => {
    t.plan(16);
    t.is(media_overlay_1.timeStrToSeconds("12.345"), 12.345);
    t.is(media_overlay_1.timeStrToSeconds("2345ms"), 2.345);
    t.is(media_overlay_1.timeStrToSeconds("345ms"), 0.345);
    t.is(media_overlay_1.timeStrToSeconds("7.75h"), 27900);
    t.is(media_overlay_1.timeStrToSeconds("76.2s"), 76.2);
    t.is(media_overlay_1.timeStrToSeconds("00:56.78"), 56.78);
    t.is(media_overlay_1.timeStrToSeconds("09:58"), 598);
    t.is(media_overlay_1.timeStrToSeconds("09.5:58"), 628);
    t.is(media_overlay_1.timeStrToSeconds("0:00:04"), 4);
    t.is(media_overlay_1.timeStrToSeconds("0:05:01.2"), 301.2);
    t.is(media_overlay_1.timeStrToSeconds("124:59:36"), 449976);
    t.is(media_overlay_1.timeStrToSeconds("5:34:31.396"), 20071.396);
    t.is(media_overlay_1.timeStrToSeconds("5:34.5:31.396"), 20101.396);
    t.is(media_overlay_1.timeStrToSeconds("7.5z"), 7.5);
    t.is(media_overlay_1.timeStrToSeconds("4:5:34:31.396"), 0);
    t.is(media_overlay_1.timeStrToSeconds(""), 0);
});
const titleStr1 = "str1";
const titleStr2 = "str2";
const titleLang1 = "lang1";
const titleLang2 = "lang2";
const titleLangStr1 = {};
titleLangStr1[titleLang1] = titleStr1;
titleLangStr1[titleLang2] = titleStr2;
const titleLangStr2 = {};
titleLangStr2[titleLang1] = titleStr2;
titleLangStr2[titleLang2] = titleStr1;
ava_1.test("JSON SERIALIZE: OPDSPublicationMetadata.Title => string", (t) => {
    const md = new opds2_publicationMetadata_1.OPDSPublicationMetadata();
    md.Title = titleStr1;
    inspect(md);
    const json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_String(t, json.title);
    t.is(json.title, titleStr1);
});
ava_1.test("JSON SERIALIZE: OPDSPublicationMetadata.Title => string-lang", (t) => {
    const md = new opds2_publicationMetadata_1.OPDSPublicationMetadata();
    md.Title = titleLangStr1;
    inspect(md);
    const json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_Object(t, json.title);
    checkType_String(t, json.title[titleLang1]);
    checkType_String(t, json.title[titleLang2]);
    t.is(json.title[titleLang1], titleStr1);
    t.is(json.title[titleLang2], titleStr2);
});
ava_1.test("JSON DESERIALIZE: OPDSPublicationMetadata.Title => string", (t) => {
    const json = {};
    json.title = titleStr1;
    logJSON(json);
    const md = ta_json_1.JSON.deserialize(json, opds2_publicationMetadata_1.OPDSPublicationMetadata);
    inspect(md);
    checkType_String(t, md.Title);
    t.is(md.Title, titleStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSPublicationMetadata.Title => string-lang", (t) => {
    const json = {};
    json.title = titleLangStr1;
    logJSON(json);
    const md = ta_json_1.JSON.deserialize(json, opds2_publicationMetadata_1.OPDSPublicationMetadata);
    inspect(md);
    checkType_Object(t, md.Title);
    t.is(md.Title[titleLang1], titleStr1);
    t.is(md.Title[titleLang2], titleStr2);
});
ava_1.test("JSON SERIALIZE: Metadata.Title => string", (t) => {
    const md = new metadata_1.Metadata();
    md.Title = titleStr1;
    inspect(md);
    const json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_String(t, json.title);
    t.is(json.title, titleStr1);
});
ava_1.test("JSON SERIALIZE: Metadata.Title => string-lang", (t) => {
    const md = new metadata_1.Metadata();
    md.Title = titleLangStr1;
    inspect(md);
    const json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_Object(t, json.title);
    checkType_String(t, json.title[titleLang1]);
    checkType_String(t, json.title[titleLang2]);
    t.is(json.title[titleLang1], titleStr1);
    t.is(json.title[titleLang2], titleStr2);
});
ava_1.test("JSON DESERIALIZE: Metadata.Title => string", (t) => {
    const json = {};
    json.title = titleStr1;
    logJSON(json);
    const md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    inspect(md);
    checkType_String(t, md.Title);
    t.is(md.Title, titleStr1);
});
ava_1.test("JSON DESERIALIZE: Metadata.Title => string-lang", (t) => {
    const json = {};
    json.title = titleLangStr1;
    logJSON(json);
    const md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    inspect(md);
    checkType_Object(t, md.Title);
    t.is(md.Title[titleLang1], titleStr1);
    t.is(md.Title[titleLang2], titleStr2);
});
const contName1 = "theName1";
const contRole1 = "theRole1";
const cont1 = new metadata_contributor_1.Contributor();
cont1.Name = contName1;
cont1.Role = contRole1;
const contName2 = "theName2";
const contRole2 = "theRole2";
const cont2 = new metadata_contributor_1.Contributor();
cont2.Name = contName2;
cont2.Role = contRole2;
ava_1.test("JSON SERIALIZE: Metadata.Imprint => Contributor[]", (t) => {
    const md = new metadata_1.Metadata();
    md.Imprint = [];
    md.Imprint.push(cont1);
    md.Imprint.push(cont2);
    inspect(md);
    const json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_Array(t, json.imprint);
    t.is(json.imprint.length, 2);
    checkType_Object(t, json.imprint[0]);
    checkType_String(t, json.imprint[0].name);
    checkType_String(t, json.imprint[0].role);
    t.is(json.imprint[0].name, contName1);
    t.is(json.imprint[0].role, contRole1);
    checkType_Object(t, json.imprint[1]);
    checkType_String(t, json.imprint[1].name);
    checkType_String(t, json.imprint[1].role);
    t.is(json.imprint[1].name, contName2);
    t.is(json.imprint[1].role, contRole2);
});
ava_1.test("JSON SERIALIZE: Metadata.Imprint => Contributor[1]", (t) => {
    const md = new metadata_1.Metadata();
    md.Imprint = [cont1];
    inspect(md);
    const json = ta_json_1.JSON.serialize(md);
    JsonUtils_1.traverseJsonObjects(json, (obj, parent, keyInParent) => {
        if (parent && obj instanceof Array && obj.length === 1) {
            parent[keyInParent] = obj[0];
        }
    });
    logJSON(json);
    checkType_Object(t, json.imprint);
    checkType_String(t, json.imprint.name);
    checkType_String(t, json.imprint.role);
    t.is(json.imprint.name, contName1);
    t.is(json.imprint.role, contRole1);
});
ava_1.test("JSON SERIALIZE: Metadata.Imprint => Contributor", (t) => {
    const md = new metadata_1.Metadata();
    md.Imprint = cont1;
    inspect(md);
    const json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_Object(t, json.imprint);
    checkType_String(t, json.imprint.name);
    checkType_String(t, json.imprint.role);
    t.is(json.imprint.name, contName1);
    t.is(json.imprint.role, contRole1);
});
ava_1.test("JSON DESERIALIZE: Metadata.Imprint => Contributor[]", (t) => {
    const json = {};
    json.imprint = [{ name: contName1, role: contRole1 }, { name: contName2, role: contRole2 }];
    logJSON(json);
    const md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    inspect(md);
    checkType_Array(t, md.Imprint);
    t.is(md.Imprint.length, 2);
    checkType(t, md.Imprint[0], metadata_contributor_1.Contributor);
    t.is(md.Imprint[0].Name, contName1);
    t.is(md.Imprint[0].Role, contRole1);
    checkType(t, md.Imprint[1], metadata_contributor_1.Contributor);
    t.is(md.Imprint[1].Name, contName2);
    t.is(md.Imprint[1].Role, contRole2);
});
ava_1.test("JSON DESERIALIZE: Metadata.Imprint => Contributor[1]", (t) => {
    const json = {};
    json.imprint = [{ name: contName1, role: contRole1 }];
    logJSON(json);
    const md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    inspect(md);
    checkType(t, md.Imprint, metadata_contributor_1.Contributor);
    t.is(md.Imprint.Name, contName1);
    t.is(md.Imprint.Role, contRole1);
});
ava_1.test("JSON DESERIALIZE: Metadata.Imprint => Contributor", (t) => {
    const json = {};
    json.imprint = { name: contName1, role: contRole1 };
    logJSON(json);
    const md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    inspect(md);
    checkType(t, md.Imprint, metadata_contributor_1.Contributor);
    t.is(md.Imprint.Name, contName1);
    t.is(md.Imprint.Role, contRole1);
});
const contextStr1 = "http://context1";
const contextStr2 = "http://context2";
ava_1.test("JSON SERIALIZE: Publication.Context => string[]", (t) => {
    const pub = new publication_1.Publication();
    pub.Context = [];
    pub.Context.push(contextStr1);
    pub.Context.push(contextStr2);
    inspect(pub);
    const json = ta_json_1.JSON.serialize(pub);
    logJSON(json);
    checkType_Array(t, json["@context"]);
    t.is(json["@context"].length, 2);
    checkType_String(t, json["@context"][0]);
    t.is(json["@context"][0], contextStr1);
    t.is(json["@context"][1], contextStr2);
});
ava_1.test("JSON SERIALIZE: Publication.Context => string[1]", (t) => {
    const pub = new publication_1.Publication();
    pub.Context = [contextStr1];
    inspect(pub);
    const json = ta_json_1.JSON.serialize(pub);
    JsonUtils_1.traverseJsonObjects(json, (obj, parent, keyInParent) => {
        if (parent && obj instanceof Array && obj.length === 1) {
            parent[keyInParent] = obj[0];
        }
    });
    logJSON(json);
    checkType_String(t, json["@context"]);
    t.is(json["@context"], contextStr1);
});
ava_1.test("JSON SERIALIZE: Publication.Context => string", (t) => {
    const pub = new publication_1.Publication();
    pub.Context = contextStr1;
    inspect(pub);
    const json = ta_json_1.JSON.serialize(pub);
    logJSON(json);
    checkType_String(t, json["@context"]);
    t.is(json["@context"], contextStr1);
});
ava_1.test("JSON DESERIALIZE: Publication.Context => string[]", (t) => {
    const json = {};
    json["@context"] = [contextStr1, contextStr2];
    logJSON(json);
    const pub = ta_json_1.JSON.deserialize(json, publication_1.Publication);
    inspect(pub);
    checkType_Array(t, pub.Context);
    t.is(pub.Context.length, 2);
    checkType_String(t, pub.Context[0]);
    t.is(pub.Context[0], contextStr1);
    checkType_String(t, pub.Context[1]);
    t.is(pub.Context[1], contextStr2);
});
ava_1.test("JSON DESERIALIZE: Publication.Context => string[1]", (t) => {
    const json = {};
    json["@context"] = [contextStr1];
    logJSON(json);
    const pub = ta_json_1.JSON.deserialize(json, publication_1.Publication);
    inspect(pub);
    checkType_String(t, pub.Context);
    t.is(pub.Context, contextStr1);
});
ava_1.test("JSON DESERIALIZE: Publication.Context => string", (t) => {
    const json = {};
    json["@context"] = contextStr1;
    logJSON(json);
    const pub = ta_json_1.JSON.deserialize(json, publication_1.Publication);
    inspect(pub);
    checkType_String(t, pub.Context);
    t.is(pub.Context, contextStr1);
});
ava_1.test("JSON SERIALIZE: OPDSFeed.Context => string[]", (t) => {
    const pub = new opds2_1.OPDSFeed();
    pub.Context = [];
    pub.Context.push(contextStr1);
    pub.Context.push(contextStr2);
    inspect(pub);
    const json = ta_json_1.JSON.serialize(pub);
    logJSON(json);
    checkType_Array(t, json["@context"]);
    t.is(json["@context"].length, 2);
    checkType_String(t, json["@context"][0]);
    t.is(json["@context"][0], contextStr1);
    t.is(json["@context"][1], contextStr2);
});
ava_1.test("JSON SERIALIZE: OPDSFeed.Context => string[1]", (t) => {
    const pub = new opds2_1.OPDSFeed();
    pub.Context = [contextStr1];
    inspect(pub);
    const json = ta_json_1.JSON.serialize(pub);
    JsonUtils_1.traverseJsonObjects(json, (obj, parent, keyInParent) => {
        if (parent && obj instanceof Array && obj.length === 1) {
            parent[keyInParent] = obj[0];
        }
    });
    logJSON(json);
    checkType_String(t, json["@context"]);
    t.is(json["@context"], contextStr1);
});
ava_1.test("JSON SERIALIZE: OPDSFeed.Context => string", (t) => {
    const pub = new opds2_1.OPDSFeed();
    pub.Context = contextStr1;
    inspect(pub);
    const json = ta_json_1.JSON.serialize(pub);
    logJSON(json);
    checkType_String(t, json["@context"]);
    t.is(json["@context"], contextStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSFeed.Context => string[]", (t) => {
    const json = {};
    json["@context"] = [contextStr1, contextStr2];
    logJSON(json);
    const pub = ta_json_1.JSON.deserialize(json, opds2_1.OPDSFeed);
    inspect(pub);
    checkType_Array(t, pub.Context);
    t.is(pub.Context.length, 2);
    checkType_String(t, pub.Context[0]);
    t.is(pub.Context[0], contextStr1);
    checkType_String(t, pub.Context[1]);
    t.is(pub.Context[1], contextStr2);
});
ava_1.test("JSON DESERIALIZE: OPDSFeed.Context => string[1]", (t) => {
    const json = {};
    json["@context"] = [contextStr1];
    logJSON(json);
    const pub = ta_json_1.JSON.deserialize(json, opds2_1.OPDSFeed);
    inspect(pub);
    checkType_String(t, pub.Context);
    t.is(pub.Context, contextStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSFeed.Context => string", (t) => {
    const json = {};
    json["@context"] = contextStr1;
    logJSON(json);
    const pub = ta_json_1.JSON.deserialize(json, opds2_1.OPDSFeed);
    inspect(pub);
    checkType_String(t, pub.Context);
    t.is(pub.Context, contextStr1);
});
const relStr1 = "rel1";
const relStr2 = "rel2";
ava_1.test("JSON SERIALIZE: OPDSLink.Rel => string[]", (t) => {
    const link = new opds2_link_1.OPDSLink();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    inspect(link);
    const json = ta_json_1.JSON.serialize(link);
    logJSON(json);
    checkType_Array(t, json.rel);
    t.is(json.rel.length, 2);
    checkType_String(t, json.rel[0]);
    t.is(json.rel[0], relStr1);
    t.is(json.rel[1], relStr2);
});
ava_1.test("JSON SERIALIZE: OPDSLink.Rel => string", (t) => {
    const link = new opds2_link_1.OPDSLink();
    link.AddRel(relStr1);
    inspect(link);
    const json = ta_json_1.JSON.serialize(link);
    logJSON(json);
    checkType_String(t, json.rel);
    t.is(json.rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string[]", (t) => {
    const json = {};
    json.rel = [relStr1, relStr2];
    logJSON(json);
    const link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    inspect(link);
    checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 2);
    checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    checkType_String(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string[1]", (t) => {
    const json = {};
    json.rel = [relStr1];
    logJSON(json);
    const link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    inspect(link);
    checkType_String(t, link.Rel);
    t.is(link.Rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string", (t) => {
    const json = {};
    json.rel = relStr1;
    logJSON(json);
    const link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    inspect(link);
    checkType_String(t, link.Rel);
    t.is(link.Rel, relStr1);
});
ava_1.test("JSON SERIALIZE: Publication Link.Rel => string[]", (t) => {
    const link = new publication_link_1.Link();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    inspect(link);
    const json = ta_json_1.JSON.serialize(link);
    logJSON(json);
    checkType_Array(t, json.rel);
    t.is(json.rel.length, 2);
    checkType_String(t, json.rel[0]);
    t.is(json.rel[0], relStr1);
    t.is(json.rel[1], relStr2);
});
ava_1.test("JSON SERIALIZE: Publication Link.Rel => string", (t) => {
    const link = new publication_link_1.Link();
    link.AddRel(relStr1);
    inspect(link);
    const json = ta_json_1.JSON.serialize(link);
    logJSON(json);
    checkType_String(t, json.rel);
    t.is(json.rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string[]", (t) => {
    const json = {};
    json.rel = [relStr1, relStr2];
    logJSON(json);
    const link = ta_json_1.JSON.deserialize(json, publication_link_1.Link);
    inspect(link);
    checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 2);
    checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    checkType_String(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string[1]", (t) => {
    const json = {};
    json.rel = [relStr1];
    logJSON(json);
    const link = ta_json_1.JSON.deserialize(json, publication_link_1.Link);
    inspect(link);
    checkType_String(t, link.Rel);
    t.is(link.Rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string", (t) => {
    const json = {};
    json.rel = relStr1;
    logJSON(json);
    const link = ta_json_1.JSON.deserialize(json, publication_link_1.Link);
    inspect(link);
    checkType_String(t, link.Rel);
    t.is(link.Rel, relStr1);
});
//# sourceMappingURL=test.js.map