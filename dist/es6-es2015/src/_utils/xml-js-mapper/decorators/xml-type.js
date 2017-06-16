"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_definition_1 = require("../classes/object-definition");
function XmlType(objectType) {
    return (target, key) => {
        const property = object_definition_1.getDefinition(target.constructor).getProperty(key);
        property.objectType = objectType;
    };
}
exports.XmlType = XmlType;
//# sourceMappingURL=xml-type.js.map