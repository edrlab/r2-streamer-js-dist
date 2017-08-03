"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const util = require("util");
const debug_ = require("debug");
const ta_json_1 = require("ta-json");
const object_definition_1 = require("ta-json/classes/object-definition");
const debug = debug_("r2:JsonPropertyEx");
function inspect(obj) {
    console.log(util.inspect(obj, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
}
function JsonPropertyEx(propertyName) {
    debug("JsonPropertyEx");
    console.log("propertyName");
    console.log(propertyName);
    return (target, key) => {
        console.log("target");
        inspect(target);
        console.log("key");
        console.log(key);
        console.log("Reflect.getMetadata('design:type', target, key)");
        const objectType = Reflect.getMetadata("design:type", target, key);
        inspect(objectType);
        console.log(objectType.name);
        console.log("target.constructor");
        inspect(target.constructor);
        console.log("getDefinition(target.constructor)");
        const objDef = object_definition_1.getDefinition(target.constructor);
        inspect(objDef);
        console.log("objDef.getProperty(key)");
        const property = objDef.getProperty(key);
        inspect(property);
        return ta_json_1.JsonProperty(propertyName)(target, key);
    };
}
exports.JsonPropertyEx = JsonPropertyEx;
//# sourceMappingURL=JsonPropertyEx.js.map