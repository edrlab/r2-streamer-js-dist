"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ta_json_1 = require("ta-json");
function timeStrToSeconds(timeStr) {
    if (!timeStr) {
        return 0;
    }
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    try {
        const iMin = timeStr.indexOf("min");
        if (iMin > 0) {
            const minsStr = timeStr.substr(0, iMin);
            minutes = parseFloat(minsStr);
        }
        else {
            const iMs = timeStr.indexOf("ms");
            if (iMs > 0) {
                const msStr = timeStr.substr(0, iMs);
                const ms = parseFloat(msStr);
                seconds = ms / 1000;
            }
            else {
                const iS = timeStr.indexOf("s");
                if (iS > 0) {
                    const sStr = timeStr.substr(0, iS);
                    seconds = parseFloat(sStr);
                }
                else {
                    const iH = timeStr.indexOf("h");
                    if (iH > 0) {
                        const hStr = timeStr.substr(0, iH);
                        hours = parseFloat(hStr);
                    }
                    else {
                        const arr = timeStr.split(":");
                        if (arr.length === 1) {
                            seconds = parseFloat(arr[0]);
                        }
                        else if (arr.length === 2) {
                            minutes = parseFloat(arr[0]);
                            seconds = parseFloat(arr[1]);
                        }
                        else if (arr.length === 3) {
                            hours = parseFloat(arr[0]);
                            minutes = parseFloat(arr[1]);
                            seconds = parseFloat(arr[2]);
                        }
                        else {
                            console.log("SMIL TIME CLOCK SYNTAX PARSING ERROR ??");
                            console.log(timeStr);
                        }
                    }
                }
            }
        }
    }
    catch (err) {
        console.log(err);
        console.log("SMIL TIME CLOCK SYNTAX PARSING ERROR!");
        console.log(timeStr);
        return 0;
    }
    return (hours * 3600) + (minutes * 60) + seconds;
}
exports.timeStrToSeconds = timeStrToSeconds;
let MediaOverlayNode = MediaOverlayNode_1 = class MediaOverlayNode {
};
tslib_1.__decorate([
    ta_json_1.JsonProperty("text"),
    tslib_1.__metadata("design:type", String)
], MediaOverlayNode.prototype, "Text", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("audio"),
    tslib_1.__metadata("design:type", String)
], MediaOverlayNode.prototype, "Audio", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("role"),
    ta_json_1.JsonElementType(String),
    tslib_1.__metadata("design:type", Array)
], MediaOverlayNode.prototype, "Role", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("children"),
    ta_json_1.JsonElementType(MediaOverlayNode_1),
    tslib_1.__metadata("design:type", Array)
], MediaOverlayNode.prototype, "Children", void 0);
MediaOverlayNode = MediaOverlayNode_1 = tslib_1.__decorate([
    ta_json_1.JsonObject()
], MediaOverlayNode);
exports.MediaOverlayNode = MediaOverlayNode;
var MediaOverlayNode_1;
//# sourceMappingURL=media-overlay.js.map