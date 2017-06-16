"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_definition_1 = require("../classes/object-definition");
function BeforeDeserialized() {
    return function (target, key) {
        var definition = object_definition_1.getDefinition(target.constructor);
        definition.beforeDeserialized = target[key];
    };
}
exports.BeforeDeserialized = BeforeDeserialized;
//# sourceMappingURL=before-deserialized.js.map