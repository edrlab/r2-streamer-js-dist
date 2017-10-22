"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riotMountMenuSelect = function (selector, opts) {
    var tag = riot.mount(selector, opts);
    return tag;
};
window.riot_menuselect = function (_opts) {
    var that = this;
    that.getIndexForId = function (id) {
        var found = this.opts.options.find(function (option) {
            return option.id === id;
        });
        return found ? this.opts.options.indexOf(found) : undefined;
    };
    that.getIndexForLabel = function (label) {
        var found = this.opts.options.find(function (option) {
            return option.label === label;
        });
        return found ? this.opts.options.indexOf(found) : undefined;
    };
    that.getLabelForId = function (id) {
        var found = this.opts.options.find(function (option) {
            return option.id === id;
        });
        return found ? found.label : undefined;
    };
    that.getIdForLabel = function (label) {
        var found = this.opts.options.find(function (option) {
            return option.label === label;
        });
        return found ? found.id : undefined;
    };
    that.setSelectedItem = function (item) {
        this.opts.selected = item;
        that.root.mdcSelect.selectedIndex = that.getIndexForId(item);
        this.update();
    };
    that.setDisabled = function (disabled) {
        this.opts.disabled = disabled;
        that.root.mdcSelect.disabled = disabled;
    };
    that.on("mount", function () {
        var menuFactory = function (menuEl) {
            var menu = new window.mdc.menu.MDCSimpleMenu(menuEl);
            menuEl.mdcSimpleMenu = menu;
            return menu;
        };
        var mdcSelector = new window.mdc.select.MDCSelect(that.root, undefined, menuFactory);
        that.root.mdcSelect = mdcSelector;
        mdcSelector.disabled = that.opts.disabled;
        mdcSelector.listen("MDCSelect:change", function (ev) {
            that.trigger("selectionChanged", ev.detail.value);
        });
    });
};
//# sourceMappingURL=index_.js.map