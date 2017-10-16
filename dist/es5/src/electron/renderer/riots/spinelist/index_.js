"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
var riot_mixin_EventTracer_1 = require("../riot_mixin_EventTracer");
exports.riotMountSpineList = function (selector, opts) {
    var tag = riot.mount(selector, opts);
    console.log(tag);
};
window.riot_spinelist = function (opts) {
    console.log(opts);
    console.log(this);
    var that = this;
    that.mixin(riot_mixin_EventTracer_1.riot_mixin_EventTracer);
    this.spine = opts.spine;
    this.url = opts.url;
    this.basic = opts.basic ? true : false;
    this.onclick = function (ev) {
        ev.preventUpdate = true;
        ev.preventDefault();
        console.log(ev.currentTarget.getAttribute("data-href"));
        var href = ev.currentTarget.getAttribute("href");
        if (href) {
            index_1.handleLink(href);
        }
    };
};
//# sourceMappingURL=index_.js.map