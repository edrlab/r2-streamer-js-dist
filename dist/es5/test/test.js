"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var media_overlay_1 = require("../src/models/media-overlay");
var ava_1 = require("ava");
var debug_ = require("debug");
var debug = debug_("r2:test");
function fn() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, Promise.resolve("foo")];
        });
    });
}
ava_1.test("dummy async test", function (t) { return __awaiter(_this, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                debug("test ASYNC");
                _b = (_a = t).is;
                return [4, fn()];
            case 1:
                _b.apply(_a, [_c.sent(), "foo"]);
                return [2];
        }
    });
}); });
ava_1.test("SMIL clock values", function (t) {
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