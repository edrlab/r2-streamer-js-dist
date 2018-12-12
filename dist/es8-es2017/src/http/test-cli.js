"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xmldom = require("xmldom");
const xml_js_mapper_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/xml-js-mapper");
const opds_1 = require("r2-opds-js/dist/es8-es2017/src/opds/opds1/opds");
const opds_entry_1 = require("r2-opds-js/dist/es8-es2017/src/opds/opds1/opds-entry");
const xmlStr = `<entry xmlns="http://opds-spec.org/2010/catalog" xmlns:atom="http://www.w3.org/2005/Atom">
<atom:updated>2000-12-31T23:59:59.999Z</atom:updated>
</entry>`;
const xmlDom = new xmldom.DOMParser().parseFromString(xmlStr);
if (!xmlDom || !xmlDom.documentElement) {
    process.exit(1);
}
const isEntry = xmlDom.documentElement.localName === "entry";
if (isEntry) {
    const opds1Entry = xml_js_mapper_1.XML.deserialize(xmlDom, opds_entry_1.Entry);
    console.log(opds1Entry);
}
else {
    const opds1Feed = xml_js_mapper_1.XML.deserialize(xmlDom, opds_1.OPDS);
    console.log(opds1Feed);
}
console.log("DONE.");
//# sourceMappingURL=test-cli.js.map