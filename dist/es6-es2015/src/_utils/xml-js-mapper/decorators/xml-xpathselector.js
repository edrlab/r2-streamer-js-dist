"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const object_definition_1 = require("../classes/object-definition");
function XmlXPathSelector(selector, namespaces) {
    return (target, key) => {
        const objectType = Reflect.getMetadata("design:type", target, key);
        const objDef = object_definition_1.getDefinition(target.constructor);
        const property = objDef.getProperty(key);
        property.xpathSelector = selector;
        if (namespaces) {
            property.namespaces = namespaces;
        }
        property.array = objectType === Array;
        property.set = objectType === Set;
        if (!property.array && !property.set && !property.objectType) {
            property.objectType = objectType;
        }
        if (property.xpathSelector.indexOf("|") < 0
            && property.xpathSelector.indexOf(">") < 0
            && property.xpathSelector.indexOf("*") < 0
            && property.xpathSelector.indexOf("||") < 0
            && property.xpathSelector.indexOf("[") < 0
            && property.xpathSelector.indexOf("]") < 0) {
            property.xpathSelectorParsed = [];
            const items = property.xpathSelector.split("/");
            items.forEach((item) => {
                if (!item.length) {
                    return;
                }
                const subitems = item.split(":");
                const isAttribute = item[0] === "@";
                const isText = item === "text()";
                const localName = subitems.length > 1 ?
                    subitems[1] :
                    (isAttribute ? subitems[0].substr(1) : subitems[0]);
                const namespacePrefix = subitems.length > 1 ?
                    (isAttribute ? subitems[0].substr(1) : subitems[0]) :
                    undefined;
                const namespaceUri = namespacePrefix ?
                    (namespaces ? namespaces[namespacePrefix] : undefined) :
                    undefined;
                const xItem = {
                    isAttribute,
                    isText,
                    localName,
                    namespacePrefix,
                    namespaceUri,
                };
                property.xpathSelectorParsed.push(xItem);
            });
        }
    };
}
exports.XmlXPathSelector = XmlXPathSelector;
//# sourceMappingURL=xml-xpathselector.js.map