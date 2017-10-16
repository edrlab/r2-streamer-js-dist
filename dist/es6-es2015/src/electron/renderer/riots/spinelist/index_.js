"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const riot_mixin_EventTracer_1 = require("../riot_mixin_EventTracer");
exports.riotMountSpineList = (selector, opts) => {
    const tag = riot.mount(selector, opts);
    console.log(tag);
};
window.riot_spinelist = function (opts) {
    console.log(opts);
    console.log(this);
    const that = this;
    that.mixin(riot_mixin_EventTracer_1.riot_mixin_EventTracer);
    this.spine = opts.spine;
    this.url = opts.url;
    this.basic = opts.basic ? true : false;
    this.onclick = (ev) => {
        ev.preventUpdate = true;
        ev.preventDefault();
        console.log(ev.currentTarget.getAttribute("data-href"));
        const href = ev.currentTarget.getAttribute("href");
        if (href) {
            index_1.handleLink(href);
        }
    };
};
//# sourceMappingURL=index_.js.map