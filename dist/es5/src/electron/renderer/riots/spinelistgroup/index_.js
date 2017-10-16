"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var riot_mixin_EventTracer_1 = require("../riot_mixin_EventTracer");
exports.riotMountSpineListGroup = function (selector, opts) {
    var tag = riot.mount(selector, opts);
    console.log(tag);
};
window.riot_spinelistgroup = function (opts) {
    console.log(opts);
    console.log(this);
    var that = this;
    that.mixin(riot_mixin_EventTracer_1.riot_mixin_EventTracer);
    this.spinegroup = opts.spinegroup;
    this.url = opts.url;
    this.basic = opts.basic ? true : false;
};
//# sourceMappingURL=index_.js.map