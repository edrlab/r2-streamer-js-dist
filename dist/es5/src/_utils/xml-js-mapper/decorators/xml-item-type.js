"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_definition_1 = require("../classes/object-definition");
function XmlItemType(objectType) {
    return function (target, key) {
        var property = object_definition_1.getDefinition(target.constructor).getProperty(key);
        property.objectType = objectType;
    };
}
exports.XmlItemType = XmlItemType;
//# sourceMappingURL=xml-item-type.js.map