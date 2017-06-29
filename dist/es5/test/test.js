"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("util");
var media_overlay_1 = require("../src/models/media-overlay");
var metadata_1 = require("../src/models/metadata");
var metadata_contributor_1 = require("../src/models/metadata-contributor");
var publication_1 = require("../src/models/publication");
var publication_link_1 = require("../src/models/publication-link");
var opds2_1 = require("../src/opds/opds2/opds2");
var opds2_link_1 = require("../src/opds/opds2/opds2-link");
var opds2_publicationMetadata_1 = require("../src/opds/opds2/opds2-publicationMetadata");
var JsonUtils_1 = require("../src/_utils/JsonUtils");
var ava_1 = require("ava");
var debug_ = require("debug");
var ta_json_1 = require("ta-json");
var debug = debug_("r2:test");
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
    var jsonStr = global.JSON.stringify(json, null, "");
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
function fn() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, Promise.resolve("foo")];
        });
    });
}
ava_1.test("dummy async test", function (t) { return __awaiter(_this, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                debug("test ASYNC");
                _b = (_a = t).is;
                return [4, fn()];
            case 1:
                _b.apply(_a, [_c.sent(), "foo"]);
                return [2];
        }
    });
}); });
ava_1.test("SMIL clock values", function (t) {
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
var titleStr1 = "str1";
var titleStr2 = "str2";
var titleLang1 = "lang1";
var titleLang2 = "lang2";
var titleLangStr1 = {};
titleLangStr1[titleLang1] = titleStr1;
titleLangStr1[titleLang2] = titleStr2;
var titleLangStr2 = {};
titleLangStr2[titleLang1] = titleStr2;
titleLangStr2[titleLang2] = titleStr1;
ava_1.test("JSON SERIALIZE: OPDSPublicationMetadata.Title => string", function (t) {
    var md = new opds2_publicationMetadata_1.OPDSPublicationMetadata();
    md.Title = titleStr1;
    inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_String(t, json.title);
    t.is(json.title, titleStr1);
});
ava_1.test("JSON SERIALIZE: OPDSPublicationMetadata.Title => string-lang", function (t) {
    var md = new opds2_publicationMetadata_1.OPDSPublicationMetadata();
    md.Title = titleLangStr1;
    inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_Object(t, json.title);
    checkType_String(t, json.title[titleLang1]);
    checkType_String(t, json.title[titleLang2]);
    t.is(json.title[titleLang1], titleStr1);
    t.is(json.title[titleLang2], titleStr2);
});
ava_1.test("JSON DESERIALIZE: OPDSPublicationMetadata.Title => string", function (t) {
    var json = {};
    json.title = titleStr1;
    logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, opds2_publicationMetadata_1.OPDSPublicationMetadata);
    inspect(md);
    checkType_String(t, md.Title);
    t.is(md.Title, titleStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSPublicationMetadata.Title => string-lang", function (t) {
    var json = {};
    json.title = titleLangStr1;
    logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, opds2_publicationMetadata_1.OPDSPublicationMetadata);
    inspect(md);
    checkType_Object(t, md.Title);
    t.is(md.Title[titleLang1], titleStr1);
    t.is(md.Title[titleLang2], titleStr2);
});
ava_1.test("JSON SERIALIZE: Metadata.Title => string", function (t) {
    var md = new metadata_1.Metadata();
    md.Title = titleStr1;
    inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_String(t, json.title);
    t.is(json.title, titleStr1);
});
ava_1.test("JSON SERIALIZE: Metadata.Title => string-lang", function (t) {
    var md = new metadata_1.Metadata();
    md.Title = titleLangStr1;
    inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_Object(t, json.title);
    checkType_String(t, json.title[titleLang1]);
    checkType_String(t, json.title[titleLang2]);
    t.is(json.title[titleLang1], titleStr1);
    t.is(json.title[titleLang2], titleStr2);
});
ava_1.test("JSON DESERIALIZE: Metadata.Title => string", function (t) {
    var json = {};
    json.title = titleStr1;
    logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    inspect(md);
    checkType_String(t, md.Title);
    t.is(md.Title, titleStr1);
});
ava_1.test("JSON DESERIALIZE: Metadata.Title => string-lang", function (t) {
    var json = {};
    json.title = titleLangStr1;
    logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    inspect(md);
    checkType_Object(t, md.Title);
    t.is(md.Title[titleLang1], titleStr1);
    t.is(md.Title[titleLang2], titleStr2);
});
var contName1 = "theName1";
var contRole1 = "theRole1";
var cont1 = new metadata_contributor_1.Contributor();
cont1.Name = contName1;
cont1.Role = contRole1;
var contName2 = "theName2";
var contRole2 = "theRole2";
var cont2 = new metadata_contributor_1.Contributor();
cont2.Name = contName2;
cont2.Role = contRole2;
ava_1.test("JSON SERIALIZE: Metadata.Imprint => Contributor[]", function (t) {
    var md = new metadata_1.Metadata();
    md.Imprint = [];
    md.Imprint.push(cont1);
    md.Imprint.push(cont2);
    inspect(md);
    var json = ta_json_1.JSON.serialize(md);
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
ava_1.test("JSON SERIALIZE: Metadata.Imprint => Contributor[1]", function (t) {
    var md = new metadata_1.Metadata();
    md.Imprint = [cont1];
    inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    JsonUtils_1.traverseJsonObjects(json, function (obj, parent, keyInParent) {
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
ava_1.test("JSON SERIALIZE: Metadata.Imprint => Contributor", function (t) {
    var md = new metadata_1.Metadata();
    md.Imprint = cont1;
    inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    logJSON(json);
    checkType_Object(t, json.imprint);
    checkType_String(t, json.imprint.name);
    checkType_String(t, json.imprint.role);
    t.is(json.imprint.name, contName1);
    t.is(json.imprint.role, contRole1);
});
ava_1.test("JSON DESERIALIZE: Metadata.Imprint => Contributor[]", function (t) {
    var json = {};
    json.imprint = [{ name: contName1, role: contRole1 }, { name: contName2, role: contRole2 }];
    logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
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
ava_1.test("JSON DESERIALIZE: Metadata.Imprint => Contributor[1]", function (t) {
    var json = {};
    json.imprint = [{ name: contName1, role: contRole1 }];
    logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    inspect(md);
    checkType(t, md.Imprint, metadata_contributor_1.Contributor);
    t.is(md.Imprint.Name, contName1);
    t.is(md.Imprint.Role, contRole1);
});
ava_1.test("JSON DESERIALIZE: Metadata.Imprint => Contributor", function (t) {
    var json = {};
    json.imprint = { name: contName1, role: contRole1 };
    logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    inspect(md);
    checkType(t, md.Imprint, metadata_contributor_1.Contributor);
    t.is(md.Imprint.Name, contName1);
    t.is(md.Imprint.Role, contRole1);
});
var contextStr1 = "http://context1";
var contextStr2 = "http://context2";
ava_1.test("JSON SERIALIZE: Publication.Context => string[]", function (t) {
    var pub = new publication_1.Publication();
    pub.Context = [];
    pub.Context.push(contextStr1);
    pub.Context.push(contextStr2);
    inspect(pub);
    var json = ta_json_1.JSON.serialize(pub);
    logJSON(json);
    checkType_Array(t, json["@context"]);
    t.is(json["@context"].length, 2);
    checkType_String(t, json["@context"][0]);
    t.is(json["@context"][0], contextStr1);
    t.is(json["@context"][1], contextStr2);
});
ava_1.test("JSON SERIALIZE: Publication.Context => string[1]", function (t) {
    var pub = new publication_1.Publication();
    pub.Context = [contextStr1];
    inspect(pub);
    var json = ta_json_1.JSON.serialize(pub);
    JsonUtils_1.traverseJsonObjects(json, function (obj, parent, keyInParent) {
        if (parent && obj instanceof Array && obj.length === 1) {
            parent[keyInParent] = obj[0];
        }
    });
    logJSON(json);
    checkType_String(t, json["@context"]);
    t.is(json["@context"], contextStr1);
});
ava_1.test("JSON SERIALIZE: Publication.Context => string", function (t) {
    var pub = new publication_1.Publication();
    pub.Context = contextStr1;
    inspect(pub);
    var json = ta_json_1.JSON.serialize(pub);
    logJSON(json);
    checkType_String(t, json["@context"]);
    t.is(json["@context"], contextStr1);
});
ava_1.test("JSON DESERIALIZE: Publication.Context => string[]", function (t) {
    var json = {};
    json["@context"] = [contextStr1, contextStr2];
    logJSON(json);
    var pub = ta_json_1.JSON.deserialize(json, publication_1.Publication);
    inspect(pub);
    checkType_Array(t, pub.Context);
    t.is(pub.Context.length, 2);
    checkType_String(t, pub.Context[0]);
    t.is(pub.Context[0], contextStr1);
    checkType_String(t, pub.Context[1]);
    t.is(pub.Context[1], contextStr2);
});
ava_1.test("JSON DESERIALIZE: Publication.Context => string[1]", function (t) {
    var json = {};
    json["@context"] = [contextStr1];
    logJSON(json);
    var pub = ta_json_1.JSON.deserialize(json, publication_1.Publication);
    inspect(pub);
    checkType_String(t, pub.Context);
    t.is(pub.Context, contextStr1);
});
ava_1.test("JSON DESERIALIZE: Publication.Context => string", function (t) {
    var json = {};
    json["@context"] = contextStr1;
    logJSON(json);
    var pub = ta_json_1.JSON.deserialize(json, publication_1.Publication);
    inspect(pub);
    checkType_String(t, pub.Context);
    t.is(pub.Context, contextStr1);
});
ava_1.test("JSON SERIALIZE: OPDSFeed.Context => string[]", function (t) {
    var pub = new opds2_1.OPDSFeed();
    pub.Context = [];
    pub.Context.push(contextStr1);
    pub.Context.push(contextStr2);
    inspect(pub);
    var json = ta_json_1.JSON.serialize(pub);
    logJSON(json);
    checkType_Array(t, json["@context"]);
    t.is(json["@context"].length, 2);
    checkType_String(t, json["@context"][0]);
    t.is(json["@context"][0], contextStr1);
    t.is(json["@context"][1], contextStr2);
});
ava_1.test("JSON SERIALIZE: OPDSFeed.Context => string[1]", function (t) {
    var pub = new opds2_1.OPDSFeed();
    pub.Context = [contextStr1];
    inspect(pub);
    var json = ta_json_1.JSON.serialize(pub);
    JsonUtils_1.traverseJsonObjects(json, function (obj, parent, keyInParent) {
        if (parent && obj instanceof Array && obj.length === 1) {
            parent[keyInParent] = obj[0];
        }
    });
    logJSON(json);
    checkType_String(t, json["@context"]);
    t.is(json["@context"], contextStr1);
});
ava_1.test("JSON SERIALIZE: OPDSFeed.Context => string", function (t) {
    var pub = new opds2_1.OPDSFeed();
    pub.Context = contextStr1;
    inspect(pub);
    var json = ta_json_1.JSON.serialize(pub);
    logJSON(json);
    checkType_String(t, json["@context"]);
    t.is(json["@context"], contextStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSFeed.Context => string[]", function (t) {
    var json = {};
    json["@context"] = [contextStr1, contextStr2];
    logJSON(json);
    var pub = ta_json_1.JSON.deserialize(json, opds2_1.OPDSFeed);
    inspect(pub);
    checkType_Array(t, pub.Context);
    t.is(pub.Context.length, 2);
    checkType_String(t, pub.Context[0]);
    t.is(pub.Context[0], contextStr1);
    checkType_String(t, pub.Context[1]);
    t.is(pub.Context[1], contextStr2);
});
ava_1.test("JSON DESERIALIZE: OPDSFeed.Context => string[1]", function (t) {
    var json = {};
    json["@context"] = [contextStr1];
    logJSON(json);
    var pub = ta_json_1.JSON.deserialize(json, opds2_1.OPDSFeed);
    inspect(pub);
    checkType_String(t, pub.Context);
    t.is(pub.Context, contextStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSFeed.Context => string", function (t) {
    var json = {};
    json["@context"] = contextStr1;
    logJSON(json);
    var pub = ta_json_1.JSON.deserialize(json, opds2_1.OPDSFeed);
    inspect(pub);
    checkType_String(t, pub.Context);
    t.is(pub.Context, contextStr1);
});
var relStr1 = "rel1";
var relStr2 = "rel2";
ava_1.test("JSON SERIALIZE: OPDSLink.Rel => string[]", function (t) {
    var link = new opds2_link_1.OPDSLink();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    logJSON(json);
    checkType_Array(t, json.rel);
    t.is(json.rel.length, 2);
    checkType_String(t, json.rel[0]);
    t.is(json.rel[0], relStr1);
    t.is(json.rel[1], relStr2);
});
ava_1.test("JSON SERIALIZE: OPDSLink.Rel => string", function (t) {
    var link = new opds2_link_1.OPDSLink();
    link.AddRel(relStr1);
    inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    logJSON(json);
    checkType_String(t, json.rel);
    t.is(json.rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string[]", function (t) {
    var json = {};
    json.rel = [relStr1, relStr2];
    logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    inspect(link);
    checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 2);
    checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    checkType_String(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string[1]", function (t) {
    var json = {};
    json.rel = [relStr1];
    logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    inspect(link);
    checkType_String(t, link.Rel);
    t.is(link.Rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string", function (t) {
    var json = {};
    json.rel = relStr1;
    logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    inspect(link);
    checkType_String(t, link.Rel);
    t.is(link.Rel, relStr1);
});
ava_1.test("JSON SERIALIZE: Publication Link.Rel => string[]", function (t) {
    var link = new publication_link_1.Link();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    logJSON(json);
    checkType_Array(t, json.rel);
    t.is(json.rel.length, 2);
    checkType_String(t, json.rel[0]);
    t.is(json.rel[0], relStr1);
    t.is(json.rel[1], relStr2);
});
ava_1.test("JSON SERIALIZE: Publication Link.Rel => string", function (t) {
    var link = new publication_link_1.Link();
    link.AddRel(relStr1);
    inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    logJSON(json);
    checkType_String(t, json.rel);
    t.is(json.rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string[]", function (t) {
    var json = {};
    json.rel = [relStr1, relStr2];
    logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, publication_link_1.Link);
    inspect(link);
    checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 2);
    checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    checkType_String(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string[1]", function (t) {
    var json = {};
    json.rel = [relStr1];
    logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, publication_link_1.Link);
    inspect(link);
    checkType_String(t, link.Rel);
    t.is(link.Rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string", function (t) {
    var json = {};
    json.rel = relStr1;
    logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, publication_link_1.Link);
    inspect(link);
    checkType_String(t, link.Rel);
    t.is(link.Rel, relStr1);
});
//# sourceMappingURL=test.js.map