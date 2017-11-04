"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ta_json_1 = require("ta-json");
let MediaOverlay = class MediaOverlay {
};
tslib_1.__decorate([
    ta_json_1.JsonProperty("active-class"),
    tslib_1.__metadata("design:type", String)
], MediaOverlay.prototype, "ActiveClass", void 0);
tslib_1.__decorate([
    ta_json_1.JsonProperty("playback-active-class"),
    tslib_1.__metadata("design:type", String)
], MediaOverlay.prototype, "PlaybackActiveClass", void 0);
MediaOverlay = tslib_1.__decorate([
    ta_json_1.JsonObject()
], MediaOverlay);
exports.MediaOverlay = MediaOverlay;
//# sourceMappingURL=metadata-media-overlay.js.map