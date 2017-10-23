"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animateProperty = (cAF, callback, property, duration, object, destVal, rAF, transition) => {
    const originVal = object[property];
    const deltaVal = destVal - originVal;
    const startTime = Date.now();
    let id = 0;
    let lastVal = 0;
    const animate = () => {
        const nowTime = Date.now();
        const newVal = Math.floor(transition(nowTime - startTime, originVal, deltaVal, duration));
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