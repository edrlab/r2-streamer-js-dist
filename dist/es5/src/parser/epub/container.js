"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("../../../../es8-es2017/src/_utils/xml-js-mapper");
var container_rootfile_1 = require("./container-rootfile");
var Container = (function () {
    function Container() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("epub:rootfiles/epub:rootfile", {
            epub: "urn:oasis:names:tc:opendocument:xmlns:container",
            rendition: "http://www.idpf.org/2013/rendition",
        }),
        xml_js_mapper_1.XmlItemType(container_rootfile_1.Rootfile),
        tslib_1.__metadata("design:type", Array)
    ], Container.prototype, "Rootfile", void 0);
    Container = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            dummyNS: "dummyURI",
            epub: "wrong2",
            rendition: "wrong1",
        })
    ], Container);
    return Container;
}());
exports.Container = Container;
//# sourceMappingURL=container.js.map