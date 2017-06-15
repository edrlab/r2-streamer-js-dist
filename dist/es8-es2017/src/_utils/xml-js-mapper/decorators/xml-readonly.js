"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_definition_1 = require("../classes/object-definition");
function XmlReadonly() {
    return (target, key) => {
        const property = object_definition_1.getDefinition(target.constructor).getProperty(key);
        property.readonly = true;
    };
}
exports.XmlReadonly = XmlReadonly;
//# sourceMappingURL=xml-readonly.js.map