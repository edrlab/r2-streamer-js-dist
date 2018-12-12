"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xmldom = require("xmldom");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var opds_1 = require("r2-opds-js/dist/es5/src/opds/opds1/opds");
var opds_entry_1 = require("r2-opds-js/dist/es5/src/opds/opds1/opds-entry");
var xmlStr = "<entry xmlns=\"http://opds-spec.org/2010/catalog\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n<atom:updated>2000-12-31T23:59:59.999Z</atom:updated>\n</entry>";
var xmlDom = new xmldom.DOMParser().parseFromString(xmlStr);
if (!xmlDom || !xmlDom.documentElement) {
    process.exit(1);
}
var isEntry = xmlDom.documentElement.localName === "entry";
if (isEntry) {
    var opds1Entry = xml_js_mapper_1.XML.deserialize(xmlDom, opds_entry_1.Entry);
    console.log(opds1Entry);
}
else {
    var opds1Feed = xml_js_mapper_1.XML.deserialize(xmlDom, opds_1.OPDS);
    console.log(opds1Feed);
}
console.log("DONE.");
//# sourceMappingURL=test-cli.js.map