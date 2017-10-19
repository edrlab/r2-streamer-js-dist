"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
exports.riotMountLinkTree = function (selector, opts) {
    var tag = riot.mount(selector, opts);
    return tag;
};
window.riot_linktree = function (_opts) {
    var that = this;
    that.setBasic = function (basic) {
        this.opts.basic = basic;
        this.update();
    };
    this.onclick = function (ev) {
        ev.preventUpdate = true;
        ev.preventDefault();
        var href = ev.currentTarget.getAttribute("href");
        if (href) {
            index_1.handleLink(href);
        }
    };
};
//# sourceMappingURL=index_.js.map