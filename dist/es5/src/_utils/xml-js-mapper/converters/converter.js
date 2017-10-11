"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var buffer_converter_1 = require("./buffer-converter");
var date_converter_1 = require("./date-converter");
exports.propertyConverters = new Map();
exports.propertyConverters.set(Buffer, new buffer_converter_1.BufferConverter());
exports.propertyConverters.set(Date, new date_converter_1.DateConverter());
//# sourceMappingURL=converter.js.map