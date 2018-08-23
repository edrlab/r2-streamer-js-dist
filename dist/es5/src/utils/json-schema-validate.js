"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var Ajv = require("ajv");
var debug_ = require("debug");
var debug = debug_("r2:streamer#utils/json-schema-validate");
var _jsonSchemas;
function webPubManifestJsonValidate(jsonSchemasRootpath, jsonToValidate) {
    try {
        debug("WebPub Manifest JSON Schema validation ...");
        if (!_jsonSchemas) {
            var jsonSchemasNames = [
                "publication",
                "contributor-object",
                "contributor",
                "link",
                "metadata",
                "subcollection",
            ];
            for (var _i = 0, jsonSchemasNames_1 = jsonSchemasNames; _i < jsonSchemasNames_1.length; _i++) {
                var jsonSchemaName = jsonSchemasNames_1[_i];
                var jsonSchemaPath = path.join(jsonSchemasRootpath, jsonSchemaName + ".schema.json");
                debug(jsonSchemaPath);
                if (!fs.existsSync(jsonSchemaPath)) {
                    debug("Skipping JSON SCHEMAS (not found): " + jsonSchemaPath);
                    return undefined;
                }
                var jsonSchemaStr = fs.readFileSync(jsonSchemaPath, { encoding: "utf8" });
                if (!jsonSchemaStr) {
                    debug("File load fail: " + jsonSchemaPath);
                    return undefined;
                }
                jsonSchemaStr = jsonSchemaStr.replace(/\?<grandfathered>/g, "");
                jsonSchemaStr = jsonSchemaStr.replace(/\?<privateUse>/g, "");
                jsonSchemaStr = jsonSchemaStr.replace(/\?<privateUse2>/g, "");
                jsonSchemaStr = jsonSchemaStr.replace(/\?<extension>/g, "");
                jsonSchemaStr = jsonSchemaStr.replace(/\?<variant>/g, "");
                jsonSchemaStr = jsonSchemaStr.replace(/\?<script>/g, "");
                jsonSchemaStr = jsonSchemaStr.replace(/\?<extlang>/g, "");
                jsonSchemaStr = jsonSchemaStr.replace(/\?<language>/g, "");
                jsonSchemaStr = jsonSchemaStr.replace(/\?<region>/g, "");
                if (jsonSchemaStr.indexOf("?<") >= 0) {
                    debug("REGEX WARNING!!");
                    return undefined;
                }
                var jsonSchema = global.JSON.parse(jsonSchemaStr);
                if (!_jsonSchemas) {
                    _jsonSchemas = [];
                }
                _jsonSchemas.push(jsonSchema);
            }
        }
        if (!_jsonSchemas) {
            return undefined;
        }
        var ajv_1 = new Ajv({ allErrors: true, coerceTypes: false, verbose: true });
        _jsonSchemas.forEach(function (jsonSchema) {
            debug("JSON Schema ADD: " + jsonSchema["$id"]);
            ajv_1.addSchema(jsonSchema, jsonSchema["$id"]);
        });
        debug("JSON Schema VALIDATE ...");
        var ajvValid = ajv_1.validate(_jsonSchemas[0]["$id"], jsonToValidate);
        if (!ajvValid) {
            debug("WebPub Manifest JSON Schema validation FAIL.");
            var errorsText = ajv_1.errorsText();
            debug(errorsText);
            return errorsText;
        }
        else {
            debug("WebPub Manifest JSON Schema validation OK.");
        }
    }
    catch (err) {
        debug("JSON Schema VALIDATION PROBLEM.");
        debug(err);
        return err;
    }
    return undefined;
}
exports.webPubManifestJsonValidate = webPubManifestJsonValidate;
//# sourceMappingURL=json-schema-validate.js.map