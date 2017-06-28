"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
var container_rootfile_1 = require("./container-rootfile");
var Container = (function () {
    function Container() {
    }
    __decorate([
        xml_js_mapper_1.XmlXPathSelector("epub:rootfiles/epub:rootfile", {
            epub: "urn:oasis:names:tc:opendocument:xmlns:container",
            rendition: "http://www.idpf.org/2013/rendition",
        }),
        xml_js_mapper_1.XmlItemType(container_rootfile_1.Rootfile),
        __metadata("design:type", Array)
    ], Container.prototype, "Rootfile", void 0);
    Container = __decorate([
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