"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xpath = require("xpath");
var object_definition_1 = require("../classes/object-definition");
var converter_1 = require("../converters/converter");
function deserialize(objectInstance, objectType, options) {
    if (options === void 0) { options = { runConstructor: false }; }
    return deserializeRootObject(objectInstance, objectType, options);
}
exports.deserialize = deserialize;
function deserializeRootObject(objectInstance, objectType, options) {
    if (objectType === void 0) { objectType = Object; }
    if (!object_definition_1.objectDefinitions.has(objectType)) {
        return undefined;
    }
    var _a = object_definition_1.getTypedInheritanceChain(objectType, objectInstance), objectType2 = _a[0], superTypes = _a.slice(1);
    var output = Object.create(objectType2.prototype);
    var definitions = superTypes.reverse().concat([objectType2]).map(function (t) { return object_definition_1.objectDefinitions.get(t); });
    definitions.forEach(function (d) {
        if (!d) {
            return;
        }
        if (options.runConstructor) {
            d.ctr.call(output);
        }
        d.beforeDeserialized.call(output);
        d.properties.forEach(function (p, key) {
            if (!p.objectType) {
                throw new Error("Cannot deserialize property \"" + key + "\" without type!");
            }
            if (p.readonly) {
                return;
            }
            if (p.xpathSelectorParsed) {
                var xpathMatched_1 = [];
                var currentNodes_1 = [objectInstance];
                p.xpathSelectorParsed.forEach(function (item, index) {
                    var nextCurrentNodes = [];
                    currentNodes_1.forEach(function (currentNode) {
                        if (item.isText) {
                            var textNode = currentNode.firstChild;
                            if (currentNode.childNodes && currentNode.childNodes.length) {
                                for (var i = 0; i < currentNode.childNodes.length; i++) {
                                    var childNode = currentNode.childNodes.item(i);
                                    if (childNode.nodeType === 3) {
                                        textNode = childNode;
                                        break;
                                    }
                                }
                            }
                            if (textNode) {
                                xpathMatched_1.push(textNode);
                            }
                        }
                        else if (item.isAttribute) {
                            if (currentNode.attributes) {
                                var attr = item.namespaceUri ?
                                    currentNode.attributes.getNamedItemNS(item.namespaceUri, item.localName) :
                                    currentNode.attributes.getNamedItem(item.localName);
                                if (attr) {
                                    xpathMatched_1.push(attr);
                                }
                            }
                        }
                        else {
                            if (currentNode.childNodes && currentNode.childNodes.length) {
                                for (var i = 0; i < currentNode.childNodes.length; i++) {
                                    var childNode = currentNode.childNodes.item(i);
                                    if (childNode.nodeType !== 1) {
                                        continue;
                                    }
                                    if (childNode.localName !== item.localName) {
                                        continue;
                                    }
                                    if (item.namespaceUri && item.namespaceUri !== childNode.namespaceURI) {
                                        continue;
                                    }
                                    nextCurrentNodes.push(childNode);
                                }
                            }
                        }
                    });
                    currentNodes_1 = nextCurrentNodes;
                    if (index === p.xpathSelectorParsed.length - 1) {
                        currentNodes_1.forEach(function (node) {
                            xpathMatched_1.push(node);
                        });
                    }
                });
                if (xpathMatched_1 && xpathMatched_1.length) {
                    if (p.array || p.set) {
                        output[key] = [];
                        xpathMatched_1.forEach(function (item) {
                            output[key].push(deserializeObject(item, p, options));
                        });
                        if (p.set) {
                            output[key] = new Set(output[key]);
                        }
                        return;
                    }
                    output[key] = deserializeObject(xpathMatched_1[0], p, options);
                }
            }
            else {
                var select = xpath.useNamespaces(p.namespaces || {});
                var xPathSelected = select(p.xpathSelector, objectInstance);
                if (xPathSelected && xPathSelected.length) {
                    var xpathMatched_2 = [];
                    if (!(xPathSelected instanceof Array)) {
                        xpathMatched_2.push(xPathSelected);
                    }
                    else {
                        xPathSelected.forEach(function (item) {
                            xpathMatched_2.push(item);
                        });
                    }
                    if (p.array || p.set) {
                        output[key] = [];
                        xpathMatched_2.forEach(function (item) {
                            output[key].push(deserializeObject(item, p, options));
                        });
                        if (p.set) {
                            output[key] = new Set(output[key]);
                        }
                        return;
                    }
                    output[key] = deserializeObject(xpathMatched_2[0], p, options);
                }
            }
        });
        d.onDeserialized.call(output);
    });
    return output;
}
function deserializeObject(objectInstance, definition, _options) {
    var primitive = definition.objectType === String
        || definition.objectType === Boolean
        || definition.objectType === Number;
    var value = objectInstance.nodeType === 3 ?
        objectInstance.data :
        (objectInstance.nodeType === 2 ?
            objectInstance.value :
            (objectInstance.nodeType === 1 ?
                objectInstance.localName :
                objectInstance.nodeValue));
    var converter = definition.converter || converter_1.propertyConverters.get(definition.objectType);
    if (converter) {
        return converter.deserialize(value);
    }
    if (!primitive) {
        var objDefinition = object_definition_1.objectDefinitions.get(definition.objectType);
        if (objDefinition) {
            return deserialize(objectInstance, definition.objectType);
        }
    }
    return value;
}
//# sourceMappingURL=deserialize.js.map