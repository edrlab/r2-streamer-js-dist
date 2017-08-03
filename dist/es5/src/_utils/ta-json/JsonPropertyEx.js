"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var util = require("util");
var debug_ = require("debug");
var ta_json_1 = require("ta-json");
var object_definition_1 = require("ta-json/classes/object-definition");
var debug = debug_("r2:JsonPropertyEx");
function inspect(obj) {
    console.log(util.inspect(obj, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
}
function JsonPropertyEx(propertyName) {
    debug("JsonPropertyEx");
    console.log("propertyName");
    console.log(propertyName);
    return function (target, key) {
        console.log("target");
        inspect(target);
        console.log("key");
        console.log(key);
        console.log("Reflect.getMetadata('design:type', target, key)");
        var objectType = Reflect.getMetadata("design:type", target, key);
        inspect(objectType);
        console.log(objectType.name);
        console.log("target.constructor");
        inspect(target.constructor);
        console.log("getDefinition(target.constructor)");
        var objDef = object_definition_1.getDefinition(target.constructor);
        inspect(objDef);
        console.log("objDef.getProperty(key)");
        var property = objDef.getProperty(key);
        inspect(property);
        return ta_json_1.JsonProperty(propertyName)(target, key);
    };
}
exports.JsonPropertyEx = JsonPropertyEx;
//# sourceMappingURL=JsonPropertyEx.js.map