"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const property_definition_1 = require("./property-definition");
class ObjectDefinition {
    constructor() {
        this.ctr = () => undefined;
        this.beforeDeserialized = () => undefined;
        this.onDeserialized = () => undefined;
        this.properties = new Map();
    }
    getProperty(key) {
        let property = this.properties.get(key);
        if (!property) {
            property = new property_definition_1.PropertyDefinition();
            this.properties.set(key, property);
        }
        return property;
    }
}
exports.ObjectDefinition = ObjectDefinition;
exports.objectDefinitions = new Map();
function getDefinition(objectType) {
    let definition = exports.objectDefinitions.get(objectType);
    if (!definition) {
        definition = new ObjectDefinition();
        exports.objectDefinitions.set(objectType, definition);
    }
    return definition;
}
exports.getDefinition = getDefinition;
function getInheritanceChain(objectType) {
    if (!objectType) {
        return [];
    }
    const parent = Object.getPrototypeOf(objectType);
    return [objectType.constructor].concat(getInheritanceChain(parent));
}
exports.getInheritanceChain = getInheritanceChain;
function getChildObjectTypeDefinitions(parentObjectType) {
    const childDefs = Array();
    exports.objectDefinitions.forEach((def, objectType) => {
        const superObjectType = Object.getPrototypeOf(objectType.prototype).constructor;
        if (superObjectType === parentObjectType) {
            childDefs.push([objectType, def]);
        }
    });
    return childDefs;
}
function getTypedInheritanceChain(objectType, objectInstance) {
    const parentDef = exports.objectDefinitions.get(objectType);
    let childDefs = Array();
    if (objectInstance && parentDef && parentDef.discriminatorProperty) {
        childDefs = childDefs.concat(getChildObjectTypeDefinitions(objectType));
    }
    let actualObjectType;
    while (childDefs.length !== 0 && !actualObjectType) {
        const arr = childDefs.shift();
        const objectType2 = arr ? arr[0] : undefined;
        const def = arr ? arr[1] : undefined;
        if (def && def.hasOwnProperty("discriminatorValue")) {
            if (objectInstance
                && parentDef
                && def.discriminatorValue === objectInstance[parentDef.discriminatorProperty]) {
                if (def.hasOwnProperty("discriminatorProperty")) {
                    return getTypedInheritanceChain(objectType2, objectInstance);
                }
                actualObjectType = objectType2;
            }
        }
        else {
            childDefs = childDefs.concat(getChildObjectTypeDefinitions(objectType2));
        }
    }
    if (!actualObjectType) {
        actualObjectType = objectType;
    }
    const inheritanceChain = new Set(getInheritanceChain(Object.create(actualObjectType.prototype)));
    return Array.from(inheritanceChain).filter((t) => exports.objectDefinitions.has(t));
}
exports.getTypedInheritanceChain = getTypedInheritanceChain;
//# sourceMappingURL=object-definition.js.map