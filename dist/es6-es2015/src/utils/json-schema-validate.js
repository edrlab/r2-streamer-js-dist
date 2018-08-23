"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const debug_ = require("debug");
const debug = debug_("r2:streamer#utils/json-schema-validate");
let _jsonSchemas;
function webPubManifestJsonValidate(jsonSchemasRootpath, jsonToValidate) {
    try {
        debug("WebPub Manifest JSON Schema validation ...");
        if (!_jsonSchemas) {
            const jsonSchemasNames = [
                "publication",
                "contributor-object",
                "contributor",
                "link",
                "metadata",
                "subcollection",
            ];
            for (const jsonSchemaName of jsonSchemasNames) {
                const jsonSchemaPath = path.join(jsonSchemasRootpath, jsonSchemaName + ".schema.json");
                debug(jsonSchemaPath);
                if (!fs.existsSync(jsonSchemaPath)) {
                    debug("Skipping JSON SCHEMAS (not found): " + jsonSchemaPath);
                    return undefined;
                }
                let jsonSchemaStr = fs.readFileSync(jsonSchemaPath, { encoding: "utf8" });
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
                const jsonSchema = global.JSON.parse(jsonSchemaStr);
                if (!_jsonSchemas) {
                    _jsonSchemas = [];
                }
                _jsonSchemas.push(jsonSchema);
            }
        }
        if (!_jsonSchemas) {
            return undefined;
        }
        const ajv = new Ajv({ allErrors: true, coerceTypes: false, verbose: true });
        _jsonSchemas.forEach((jsonSchema) => {
            debug("JSON Schema ADD: " + jsonSchema["$id"]);
            ajv.addSchema(jsonSchema, jsonSchema["$id"]);
        });
        debug("JSON Schema VALIDATE ...");
        const ajvValid = ajv.validate(_jsonSchemas[0]["$id"], jsonToValidate);
        if (!ajvValid) {
            debug("WebPub Manifest JSON Schema validation FAIL.");
            const errorsText = ajv.errorsText();
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