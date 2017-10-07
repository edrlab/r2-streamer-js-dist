"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ta_json_1 = require("ta-json");
function timeStrToSeconds(timeStr) {
    if (!timeStr) {
        return 0;
    }
    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    try {
        var iMin = timeStr.indexOf("min");
        if (iMin > 0) {
            var minsStr = timeStr.substr(0, iMin);
            minutes = parseFloat(minsStr);
        }
        else {
            var iMs = timeStr.indexOf("ms");
            if (iMs > 0) {
                var msStr = timeStr.substr(0, iMs);
                var ms = parseFloat(msStr);
                seconds = ms / 1000;
            }
            else {
                var iS = timeStr.indexOf("s");
                if (iS > 0) {
                    var sStr = timeStr.substr(0, iS);
                    seconds = parseFloat(sStr);
                }
                else {
                    var iH = timeStr.indexOf("h");
                    if (iH > 0) {
                        var hStr = timeStr.substr(0, iH);
                        hours = parseFloat(hStr);
                    }
                    else {
                        var arr = timeStr.split(":");
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
var MediaOverlayNode = (function () {
    function MediaOverlayNode() {
    }
    MediaOverlayNode_1 = MediaOverlayNode;
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
    return MediaOverlayNode;
    var MediaOverlayNode_1;
}());
exports.MediaOverlayNode = MediaOverlayNode;
//# sourceMappingURL=media-overlay.js.map