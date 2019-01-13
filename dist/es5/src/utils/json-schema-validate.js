"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var Ajv = require("ajv");
var debug_ = require("debug");
var debug = debug_("r2:streamer#utils/json-schema-validate");
var _cachedJsonSchemas = {};
function jsonSchemaValidate(jsonSchemasRootpath, jsonSchemasNames, jsonToValidate) {
    try {
        for (var _i = 0, jsonSchemasNames_1 = jsonSchemasNames; _i < jsonSchemasNames_1.length; _i++) {
            var jsonSchemaName = jsonSchemasNames_1[_i];
            var jsonSchemaPath = path.join(jsonSchemasRootpath, jsonSchemaName + ".schema.json");
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
        var ajv = new Ajv({ allErrors: true, coerceTypes: false, verbose: true });
        var idRoot = void 0;
        for (var _a = 0, jsonSchemasNames_2 = jsonSchemasNames; _a < jsonSchemasNames_2.length; _a++) {
            var jsonSchemaName = jsonSchemasNames_2[_a];
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
                for (var _b = 0, errors_1 = errors; _b < errors_1.length; _b++) {
                    var err = errors_1[_b];
                    var jsonPath = err.dataPath.replace(/^\./, "").replace(/\[([0-9]+)\]/g, ".$1");
                    errs.push({
                        ajvDataPath: err.dataPath,
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
        return err;
    }
    return undefined;
}
exports.jsonSchemaValidate = jsonSchemaValidate;
//# sourceMappingURL=json-schema-validate.js.map