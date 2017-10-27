"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animateProperty = function (cAF, callback, property, duration, object, destVal, rAF, transition) {
    var originVal = object[property];
    var deltaVal = destVal - originVal;
    var startTime = Date.now();
    var id = 0;
    var lastVal = 0;
    var animate = function () {
        var nowTime = Date.now();
        var newVal = Math.floor(transition(nowTime - startTime, originVal, deltaVal, duration));
        if (!lastVal || object[property] !== destVal) {
            object[property] = newVal;
            lastVal = newVal;
        }
        else {
            if (callback) {
                callback(true);
            }
            cAF(id);
            return;
        }
        if (nowTime > (startTime + duration)) {
            object[property] = destVal;
            if (callback) {
                callback(false);
            }
            cAF(id);
            return;
        }
        id = rAF(animate);
    };
    id = rAF(animate);
};
//# sourceMappingURL=animateProperty.js.map