"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sortObject(obj) {
    if (obj instanceof Array) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = sortObject(obj[i]);
        }
        return obj;
    }
    else if (typeof obj !== "object") {
        return obj;
    }
    const newObj = {};
    Object.keys(obj).sort().forEach((key) => {
        newObj[key] = sortObject(obj[key]);
    });
    return newObj;
}
exports.sortObject = sortObject;
function traverseJsonObjects(obj, func) {
    func(obj);
    if (obj instanceof Array) {
        obj.forEach((item) => {
            if (item) {
                traverseJsonObjects(item, func);
            }
        });
    }
    else if (typeof obj === "object") {
        Object.keys(obj).forEach((key) => {
            if (obj.hasOwnProperty(key) && obj[key]) {
                traverseJsonObjects(obj[key], func);
            }
        });
    }
}
exports.traverseJsonObjects = traverseJsonObjects;
//# sourceMappingURL=JsonUtils.js.map