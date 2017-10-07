"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var cbz_1 = require("../../../es8-es2017/src/parser/cbz");
var epub_1 = require("../../../es8-es2017/src/parser/epub");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var fileName, ext;
        return tslib_1.__generator(this, function (_a) {
            fileName = path.basename(filePath);
            ext = path.extname(fileName).toLowerCase();
            return [2, /\.epub[3]?$/.test(ext) ?
                    epub_1.EpubParsePromise(filePath) :
                    cbz_1.CbzParsePromise(filePath)];
        });
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map