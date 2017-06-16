"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_definition_1 = require("../classes/object-definition");
function XmlDiscriminatorValue(value) {
    return (objectType) => {
        object_definition_1.getDefinition(objectType).discriminatorValue = value;
    };
}
exports.XmlDiscriminatorValue = XmlDiscriminatorValue;
//# sourceMappingURL=xml-discriminator-value.js.map