"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const media_overlay_1 = require("../src/models/media-overlay");
const ava_1 = require("ava");
const debug_ = require("debug");
const debug = debug_("r2:test");
function fn() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return Promise.resolve("foo");
    });
}
ava_1.test("dummy async test", (t) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    debug("test ASYNC");
    t.is(yield fn(), "foo");
}));
ava_1.test("SMIL clock values", (t) => {
    t.plan(16);
    t.is(media_overlay_1.timeStrToSeconds("12.345"), 12.345);
    t.is(media_overlay_1.timeStrToSeconds("2345ms"), 2.345);
    t.is(media_overlay_1.timeStrToSeconds("345ms"), 0.345);
    t.is(media_overlay_1.timeStrToSeconds("7.75h"), 27900);
    t.is(media_overlay_1.timeStrToSeconds("76.2s"), 76.2);
    t.is(media_overlay_1.timeStrToSeconds("00:56.78"), 56.78);
    t.is(media_overlay_1.timeStrToSeconds("09:58"), 598);
    t.is(media_overlay_1.timeStrToSeconds("09.5:58"), 628);
    t.is(media_overlay_1.timeStrToSeconds("0:00:04"), 4);
    t.is(media_overlay_1.timeStrToSeconds("0:05:01.2"), 301.2);
    t.is(media_overlay_1.timeStrToSeconds("124:59:36"), 449976);
    t.is(media_overlay_1.timeStrToSeconds("5:34:31.396"), 20071.396);
    t.is(media_overlay_1.timeStrToSeconds("5:34.5:31.396"), 20101.396);
    t.is(media_overlay_1.timeStrToSeconds("7.5z"), 7.5);
    t.is(media_overlay_1.timeStrToSeconds("4:5:34:31.396"), 0);
    t.is(media_overlay_1.timeStrToSeconds(""), 0);
});
//# sourceMappingURL=test.js.map