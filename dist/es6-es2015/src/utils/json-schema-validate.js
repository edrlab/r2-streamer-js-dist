"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonSchemaValidate = void 0;
const ajv_1 = require("ajv");
const ajv_formats_1 = require("ajv-formats");
const debug_ = require("debug");
const fs = require("fs");
const path = require("path");
const debug = debug_("r2:streamer#utils/json-schema-validate");
const _cachedJsonSchemas = {};
function jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, jsonToValidate) {
    var _a;
    try {
        for (const jsonSchemaName of jsonSchemasNames) {
            const jsonSchemaName_ = jsonSchemaName.replace(/\//g, path.sep);
            const jsonSchemaPath = path.join(jsonSchemasRootpath, jsonSchemaName_ + ".schema.json");
            if (_cachedJsonSchemas[jsonSchemaPath]) {
                continue;
            }
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
            debug(`JSON SCHEMA is now cached: ${jsonSchema["$id"]} (${jsonSchemaPath})`);
            _cachedJsonSchemas[jsonSchemaPath] = jsonSchema;
        }
        const ajv = new ajv_1.default({
            allErrors: true,
            allowUnionTypes: true,
            coerceTypes: false,
            strict: true,
            strictRequired: "log",
            validateFormats: true,
            verbose: true,
        });
        ajv_formats_1.default(ajv);
        let idRoot;
        for (const jsonSchemaName of jsonSchemasNames) {
            const jsonSchemaPath = path.join(jsonSchemasRootpath, jsonSchemaName + ".schema.json");
            const jsonSchema = _cachedJsonSchemas[jsonSchemaPath];
            if (!jsonSchema) {
                debug("!jsonSchema?? " + jsonSchemaPath);
                return undefined;
            }
            if (!idRoot) {
                idRoot = jsonSchema["$id"];
            }
            ajv.addSchema(jsonSchema, jsonSchema["$id"]);
        }
        if (!idRoot) {
            debug("!idRoot?? ");
            return undefined;
        }
        const ajvValid = ajv.validate(idRoot, jsonToValidate);
        if (!ajvValid) {
            const errors = ajv.errors;
            if (errors) {
                const errs = [];
                for (const err of errors) {
                    const jsonPath = (_a = err.instancePath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "").replace(/\[([0-9]+)\]/g, ".$1");
                    errs.push({
                        ajvDataPath: err.instancePath,
                        ajvMessage: err.message ? err.message : "",
                        ajvSchemaPath: err.schemaPath,
                        jsonPath,
                    });
                }
                return errs;
            }
        }
    }
    catch (err) {
        debug("JSON Schema VALIDATION PROBLEM.");
        debug(err);
        const errs = [];
        errs.push({
            ajvDataPath: err && toString ? err.toString() : "ajvDataPath",
            ajvMessage: err.message ? err.message : "ajvMessage",
            ajvSchemaPath: "ajvSchemaPath",
            jsonPath: "jsonPath",
        });
        return errs;
    }
    return undefined;
}
exports.jsonSchemaValidate = jsonSchemaValidate;
//# sourceMappingURL=json-schema-validate.js.map