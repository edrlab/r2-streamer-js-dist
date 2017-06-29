"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const cbz_1 = require("./cbz");
const epub_1 = require("./epub");
function PublicationParsePromise(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();
        const check = /\.epub[3]?$/.test(ext);
        console.log(check);
        console.log(ext);
        console.log(fileName);
        console.log(filePath);
        return check ?
            epub_1.EpubParsePromise(filePath) :
            cbz_1.CbzParsePromise(filePath);
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map