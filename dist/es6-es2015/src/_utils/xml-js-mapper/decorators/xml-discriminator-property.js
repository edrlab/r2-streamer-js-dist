"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_definition_1 = require("../classes/object-definition");
function XmlDiscriminatorProperty(property) {
    return (objectType) => {
        object_definition_1.getDefinition(objectType).discriminatorProperty = property;
    };
}
exports.XmlDiscriminatorProperty = XmlDiscriminatorProperty;
//# sourceMappingURL=xml-discriminator-property.js.map