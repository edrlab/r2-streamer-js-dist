"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deserialize_1 = require("./methods/deserialize");
class XML {
    static deserialize(objectInstance, objectType, options) {
        if (objectInstance.nodeType === 9) {
            objectInstance = objectInstance.documentElement;
        }
        return deserialize_1.deserialize(objectInstance, objectType, options);
    }
}
exports.XML = XML;
//# sourceMappingURL=xml.js.map