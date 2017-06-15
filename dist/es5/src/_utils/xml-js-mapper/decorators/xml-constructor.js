"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_definition_1 = require("../classes/object-definition");
function XmlConstructor() {
    return function (target, key) {
        var definition = object_definition_1.getDefinition(target.constructor);
        definition.ctr = target[key];
    };
}
exports.XmlConstructor = XmlConstructor;
//# sourceMappingURL=xml-constructor.js.map