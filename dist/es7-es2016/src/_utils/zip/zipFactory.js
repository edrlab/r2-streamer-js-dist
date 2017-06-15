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
const UrlUtils_1 = require("../http/UrlUtils");
const zip1_1 = require("./zip1");
const zip2_1 = require("./zip2");
function zipLoadPromise(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (UrlUtils_1.isHTTP(filePath)) {
            return zip2_1.Zip2.loadPromise(filePath);
        }
        return zip1_1.Zip1.loadPromise(filePath);
    });
}
exports.zipLoadPromise = zipLoadPromise;
//# sourceMappingURL=zipFactory.js.map