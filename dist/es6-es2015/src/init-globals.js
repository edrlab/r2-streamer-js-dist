"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metadata_collection_1 = require("../../es8-es2017/src/models/metadata-collection");
const metadata_collection_json_converter_1 = require("../../es8-es2017/src/models/metadata-collection-json-converter");
const metadata_contributor_1 = require("../../es8-es2017/src/models/metadata-contributor");
const metadata_contributor_json_converter_1 = require("../../es8-es2017/src/models/metadata-contributor-json-converter");
const opds2_collection_1 = require("../../es8-es2017/src/opds/opds2/opds2-collection");
const opds2_collection_json_converter_1 = require("../../es8-es2017/src/opds/opds2/opds2-collection-json-converter");
const ta_json_date_converter_1 = require("../../es8-es2017/src/_utils/ta-json-date-converter");
const xml_js_mapper_1 = require("../../es8-es2017/src/_utils/xml-js-mapper");
const ta_json_1 = require("ta-json");
function initGlobals() {
    ta_json_1.propertyConverters.set(Buffer, new ta_json_1.BufferConverter());
    ta_json_1.propertyConverters.set(Date, new ta_json_date_converter_1.JsonDateConverter());
    ta_json_1.propertyConverters.set(metadata_contributor_1.Contributor, new metadata_contributor_json_converter_1.JsonContributorConverter());
    ta_json_1.propertyConverters.set(metadata_collection_1.Collection, new metadata_collection_json_converter_1.JsonCollectionConverter());
    ta_json_1.propertyConverters.set(opds2_collection_1.OPDSCollection, new opds2_collection_json_converter_1.JsonOPDSCollectionConverter());
    xml_js_mapper_1.propertyConverters.set(Buffer, new xml_js_mapper_1.BufferConverter());
    xml_js_mapper_1.propertyConverters.set(Date, new xml_js_mapper_1.DateConverter());
}
exports.initGlobals = initGlobals;
//# sourceMappingURL=init-globals.js.map