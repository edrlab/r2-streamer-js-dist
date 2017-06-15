"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_definition_1 = require("../classes/object-definition");
function XmlWriteonly() {
    return (target, key) => {
        const property = object_definition_1.getDefinition(target.constructor).getProperty(key);
        property.writeonly = true;
    };
}
exports.XmlWriteonly = XmlWriteonly;
//# sourceMappingURL=xml-writeonly.js.map