"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
const container_rootfile_1 = require("./container-rootfile");
let Container = class Container {
};
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
exports.Container = Container;
//# sourceMappingURL=container.js.map