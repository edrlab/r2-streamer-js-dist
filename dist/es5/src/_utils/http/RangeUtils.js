"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseRangeHeader(rangeHeader) {
    var ranges = [];
    var iEqual = rangeHeader.indexOf("=");
    if (iEqual <= 0) {
        return ranges;
    }
    var rangesStr = rangeHeader.substr(iEqual + 1);
    var rangeStrArray = rangesStr.split(",");
    rangeStrArray.forEach(function (rangeStr) {
        var beginEndArray = rangeStr.split("-");
        var beginStr = beginEndArray[0];
        var endStr = beginEndArray[1];
        var begin = -1;
        if (beginStr && beginStr.length) {
            begin = parseInt(beginStr, 10);
        }
        var end = -1;
        if (endStr && endStr.length) {
            end = parseInt(endStr, 10);
        }
        var rangeObj = { begin: begin, end: end };
        ranges.push(rangeObj);
    });
    return ranges;
}
exports.parseRangeHeader = parseRangeHeader;
function combineRanges(ranges) {
    var orderedRanges = ranges
        .map(function (range, index) {
        return {
            begin: range.begin,
            end: range.end,
            index: index,
        };
    })
        .sort(function (a, b) {
        return a.begin - b.begin;
    });
    var j = 0;
    var i = 1;
    for (j = 0, i = 1; i < orderedRanges.length; i++) {
        var orderedRange = orderedRanges[i];
        var currentRange = orderedRanges[j];
        if (orderedRange.begin > currentRange.end + 1) {
            orderedRanges[++j] = orderedRange;
        }
        else if (orderedRange.end > currentRange.end) {
            currentRange.end = orderedRange.end;
            currentRange.index = Math.min(currentRange.index, orderedRange.index);
        }
    }
    orderedRanges.length = j + 1;
    return orderedRanges
        .sort(function (a, b) {
        return a.index - b.index;
    })
        .map(function (range) {
        return {
            begin: range.begin,
            end: range.end,
        };
    });
}
exports.combineRanges = combineRanges;
//# sourceMappingURL=RangeUtils.js.map