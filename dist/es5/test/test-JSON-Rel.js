"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var publication_link_1 = require("../../es8-es2017/src/models/publication-link");
var opds2_link_1 = require("../../es8-es2017/src/opds/opds2/opds2-link");
var ava_1 = require("ava");
var ta_json_1 = require("ta-json");
var lcp_1 = require("../../es8-es2017/src/parser/epub/lcp");
var init_globals_1 = require("../src/init-globals");
var helpers_1 = require("./helpers");
init_globals_1.initGlobals();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP/lcp.node"));
var relStr1 = "rel1";
var relStr2 = "rel2";
ava_1.test("JSON SERIALIZE: OPDSLink.Rel => string[]", function (t) {
    var link = new opds2_link_1.OPDSLink();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    helpers_1.inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json.rel);
    t.is(json.rel.length, 2);
    helpers_1.checkType_String(t, json.rel[0]);
    t.is(json.rel[0], relStr1);
    helpers_1.checkType_String(t, json.rel[1]);
    t.is(json.rel[1], relStr2);
});
ava_1.test("JSON SERIALIZE: OPDSLink.Rel => string[] (recursive links)", function (t) {
    var link = new opds2_link_1.OPDSLink();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    var child = new opds2_link_1.OPDSLink();
    child.AddRel(relStr2);
    child.AddRel(relStr1);
    link.Children = [];
    link.Children.push(child);
    helpers_1.inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json.rel);
    t.is(json.rel.length, 2);
    helpers_1.checkType_String(t, json.rel[0]);
    t.is(json.rel[0], relStr1);
    helpers_1.checkType_String(t, json.rel[1]);
    t.is(json.rel[1], relStr2);
    helpers_1.checkType_Array(t, json.children);
    t.is(json.children.length, 1);
    helpers_1.checkType_Array(t, json.children[0].rel);
    t.is(json.children[0].rel.length, 2);
    helpers_1.checkType_String(t, json.children[0].rel[0]);
    t.is(json.children[0].rel[0], relStr2);
    helpers_1.checkType_String(t, json.children[0].rel[1]);
    t.is(json.children[0].rel[1], relStr1);
});
ava_1.test("JSON SERIALIZE: OPDSLink.Rel => string", function (t) {
    var link = new opds2_link_1.OPDSLink();
    link.AddRel(relStr1);
    helpers_1.inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_String(t, json.rel);
    t.is(json.rel, relStr1);
});
ava_1.test("JSON SERIALIZE: OPDSLink.Rel => string (recursive links)", function (t) {
    var link = new opds2_link_1.OPDSLink();
    link.AddRel(relStr1);
    var child = new opds2_link_1.OPDSLink();
    child.AddRel(relStr2);
    link.Children = [];
    link.Children.push(child);
    helpers_1.inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_String(t, json.rel);
    t.is(json.rel, relStr1);
    helpers_1.checkType_Array(t, json.children);
    t.is(json.children.length, 1);
    helpers_1.checkType_String(t, json.children[0].rel);
    t.is(json.children[0].rel, relStr2);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string[]", function (t) {
    var json = {};
    json.rel = [relStr1, relStr2];
    helpers_1.logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 2);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    helpers_1.checkType_String(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string[] (recursive children)", function (t) {
    var json = {};
    json.rel = [relStr1, relStr2];
    json.children = [];
    json.children.push({ rel: [relStr2, relStr1] });
    helpers_1.logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 2);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    helpers_1.checkType_String(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
    helpers_1.checkType_Array(t, link.Children);
    t.is(link.Children.length, 1);
    helpers_1.checkType_Array(t, link.Children[0].Rel);
    t.is(link.Children[0].Rel.length, 2);
    helpers_1.checkType_String(t, link.Children[0].Rel[0]);
    t.is(link.Children[0].Rel[0], relStr2);
    helpers_1.checkType_String(t, link.Children[0].Rel[1]);
    t.is(link.Children[0].Rel[1], relStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string[1]", function (t) {
    var json = {};
    json.rel = [relStr1];
    helpers_1.logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 1);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string", function (t) {
    var json = {};
    json.rel = relStr1;
    helpers_1.logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 1);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSLink.Rel => string (recursive children)", function (t) {
    var json = {};
    json.rel = relStr1;
    json.children = [];
    json.children.push({ rel: relStr2 });
    helpers_1.logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, opds2_link_1.OPDSLink);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 1);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    helpers_1.checkType_Array(t, link.Children);
    t.is(link.Children.length, 1);
    helpers_1.checkType_Array(t, link.Children[0].Rel);
    t.is(link.Children[0].Rel.length, 1);
    helpers_1.checkType_String(t, link.Children[0].Rel[0]);
    t.is(link.Children[0].Rel[0], relStr2);
});
ava_1.test("JSON SERIALIZE: Publication Link.Rel => string[]", function (t) {
    var link = new publication_link_1.Link();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    helpers_1.inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json.rel);
    t.is(json.rel.length, 2);
    helpers_1.checkType_String(t, json.rel[0]);
    t.is(json.rel[0], relStr1);
    helpers_1.checkType_String(t, json.rel[1]);
    t.is(json.rel[1], relStr2);
});
ava_1.test("JSON SERIALIZE: Publication Link.Rel => string", function (t) {
    var link = new publication_link_1.Link();
    link.AddRel(relStr1);
    helpers_1.inspect(link);
    var json = ta_json_1.JSON.serialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_String(t, json.rel);
    t.is(json.rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string[]", function (t) {
    var json = {};
    json.rel = [relStr1, relStr2];
    helpers_1.logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, publication_link_1.Link);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 2);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    helpers_1.checkType_String(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string[1]", function (t) {
    var json = {};
    json.rel = [relStr1];
    helpers_1.logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, publication_link_1.Link);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 1);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string", function (t) {
    var json = {};
    json.rel = relStr1;
    helpers_1.logJSON(json);
    var link = ta_json_1.JSON.deserialize(json, publication_link_1.Link);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 1);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
//# sourceMappingURL=test-JSON-Rel.js.map