"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_definition_1 = require("../classes/object-definition");
function XmlObject(namespaces) {
    return (objectType) => {
        const def = object_definition_1.getDefinition(objectType);
        if (namespaces) {
            def.namespaces = namespaces;
        }
        if (def.namespaces && def.properties) {
            def.properties.forEach((propDef) => {
                if (def.namespaces) {
                    for (const prop in def.namespaces) {
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
                        propDef.xpathSelectorParsed.forEach((xp) => {
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