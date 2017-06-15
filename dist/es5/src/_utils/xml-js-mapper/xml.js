"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deserialize_1 = require("./methods/deserialize");
var XML = (function () {
    function XML() {
    }
    XML.deserialize = function (objectInstance, objectType, options) {
        if (objectInstance.nodeType === 9) {
            objectInstance = objectInstance.documentElement;
        }
        return deserialize_1.deserialize(objectInstance, objectType, options);
    };
    return XML;
}());
exports.XML = XML;
//# sourceMappingURL=xml.js.map