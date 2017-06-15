"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sortObject(obj) {
    if (obj instanceof Array) {
        for (var i = 0; i < obj.length; i++) {
            obj[i] = sortObject(obj[i]);
        }
        return obj;
    }
    else if (typeof obj !== "object") {
        return obj;
    }
    var newObj = {};
    Object.keys(obj).sort().forEach(function (key) {
        newObj[key] = sortObject(obj[key]);
    });
    return newObj;
}
exports.sortObject = sortObject;
//# sourceMappingURL=JsonUtils.js.map