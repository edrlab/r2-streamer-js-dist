"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_definition_1 = require("../classes/object-definition");
function XmlObject(namespaces) {
    return function (objectType) {
        var def = object_definition_1.getDefinition(objectType);
        if (namespaces) {
            def.namespaces = namespaces;
        }
        if (def.namespaces && def.properties) {
            def.properties.forEach(function (propDef) {
                if (def.namespaces) {
                    for (var prop in def.namespaces) {
                        if (def.namespaces.hasOwnProperty(prop)) {
                            if (!propDef.namespaces || !propDef.namespaces[prop]) {
                                if (!propDef.namespaces) {
                                    propDef.namespaces = {};
                                }
                                propDef.namespaces[prop] = def.namespaces[prop];
                            }
                        }
                    }
                    if (propDef.xpathSelectorParsed) {
                        propDef.xpathSelectorParsed.forEach(function (xp) {
                            if (xp.namespacePrefix && !xp.namespaceUri) {
                                xp.namespaceUri = propDef.namespaces ?
                                    propDef.namespaces[xp.namespacePrefix] :
                                    undefined;
                            }
                        });
                    }
                }
            });
        }
    };
}
exports.XmlObject = XmlObject;
//# sourceMappingURL=xml-object.js.map