"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_definition_1 = require("../classes/object-definition");
function OnDeserialized() {
    return function (target, key) {
        var definition = object_definition_1.getDefinition(target.constructor);
        definition.onDeserialized = target[key];
    };
}
exports.OnDeserialized = OnDeserialized;
//# sourceMappingURL=on-deserialized.js.map