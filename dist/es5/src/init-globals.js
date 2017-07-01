"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var metadata_contributor_1 = require("./models/metadata-contributor");
var metadata_contributor_json_converter_1 = require("./models/metadata-contributor-json-converter");
var ta_json_date_converter_1 = require("./_utils/ta-json-date-converter");
var xml_js_mapper_1 = require("./_utils/xml-js-mapper");
var ta_json_1 = require("ta-json");
function initGlobals() {
    ta_json_1.propertyConverters.set(Buffer, new ta_json_1.BufferConverter());
    ta_json_1.propertyConverters.set(Date, new ta_json_date_converter_1.JsonDateConverter());
    ta_json_1.propertyConverters.set(metadata_contributor_1.Contributor, new metadata_contributor_json_converter_1.JsonContributorConverter());
    xml_js_mapper_1.propertyConverters.set(Buffer, new xml_js_mapper_1.BufferConverter());
    xml_js_mapper_1.propertyConverters.set(Date, new xml_js_mapper_1.DateConverter());
}
exports.initGlobals = initGlobals;
//# sourceMappingURL=init-globals.js.map