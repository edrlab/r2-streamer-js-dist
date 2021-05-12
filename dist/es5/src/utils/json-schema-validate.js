"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonSchemaValidate = void 0;
var ajv_1 = require("ajv");
var ajv_formats_1 = require("ajv-formats");
var debug_ = require("debug");
var fs = require("fs");
var path = require("path");
var debug = debug_("r2:streamer#utils/json-schema-validate");
var _cachedJsonSchemas = {};
function jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, jsonToValidate) {
    var _a;
    try {
        for (var _i = 0, jsonSchemasNames_1 = jsonSchemasNames; _i < jsonSchemasNames_1.length; _i++) {
            var jsonSchemaName = jsonSchemasNames_1[_i];
            var jsonSchemaName_ = jsonSchemaName.replace(/\//g, path.sep);
            var jsonSchemaPath = path.join(jsonSchemasRootpath, jsonSchemaName_ + ".schema.json");
            if (_cachedJsonSchemas[jsonSchemaPath]) {
                continue;
            }
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
            debug("JSON SCHEMA is now cached: " + jsonSchema["$id"] + " (" + jsonSchemaPath + ")");
            _cachedJsonSchemas[jsonSchemaPath] = jsonSchema;
        }
        var ajv = new ajv_1.default({
            allErrors: true,
            allowUnionTypes: true,
            coerceTypes: false,
            strict: true,
            strictRequired: "log",
            validateFormats: true,
            verbose: true,
        });
        ajv_formats_1.default(ajv);
        var idRoot = void 0;
        for (var _b = 0, jsonSchemasNames_2 = jsonSchemasNames; _b < jsonSchemasNames_2.length; _b++) {
            var jsonSchemaName = jsonSchemasNames_2[_b];
            var jsonSchemaPath = path.join(jsonSchemasRootpath, jsonSchemaName + ".schema.json");
            var jsonSchema = _cachedJsonSchemas[jsonSchemaPath];
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
        var ajvValid = ajv.validate(idRoot, jsonToValidate);
        if (!ajvValid) {
            var errors = ajv.errors;
            if (errors) {
                var errs = [];
                for (var _c = 0, errors_1 = errors; _c < errors_1.length; _c++) {
                    var err = errors_1[_c];
                    var jsonPath = (_a = err.instancePath) === null || _a === void 0 ? void 0 : _a.replace(/^\./, "").replace(/\[([0-9]+)\]/g, ".$1");
                    errs.push({
                        ajvDataPath: err.instancePath,
                        ajvMessage: err.message ? err.message : "",
                        ajvSchemaPath: err.schemaPath,
                        jsonPath: jsonPath,
                    });
                }
                return errs;
            }
        }
    }
    catch (err) {
        debug("JSON Schema VALIDATION PROBLEM.");
        debug(err);
        var errs = [];
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