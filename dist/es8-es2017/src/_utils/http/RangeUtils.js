"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseRangeHeader(rangeHeader) {
    const ranges = [];
    if (!rangeHeader) {
        return ranges;
    }
    let rHeader;
    if (rangeHeader instanceof Array) {
        rHeader = rangeHeader;
    }
    else {
        rHeader = [rangeHeader];
    }
    rHeader.forEach((rh) => {
        const arr = parseRangeHeader_(rh);
        ranges.concat(arr);
    });
    return ranges;
}
exports.parseRangeHeader = parseRangeHeader;
function parseRangeHeader_(rangeHeader) {
    const ranges = [];
    const iEqual = rangeHeader.indexOf("=");
    if (iEqual <= 0) {
        return ranges;
    }
    const rangesStr = rangeHeader.substr(iEqual + 1);
    const rangeStrArray = rangesStr.split(",");
    rangeStrArray.forEach((rangeStr) => {
        const beginEndArray = rangeStr.split("-");
        const beginStr = beginEndArray[0];
        const endStr = beginEndArray[1];
        let begin = -1;
        if (beginStr && beginStr.length) {
            begin = parseInt(beginStr, 10);
        }
        let end = -1;
        if (endStr && endStr.length) {
            end = parseInt(endStr, 10);
        }
        const rangeObj = { begin, end };
        ranges.push(rangeObj);
    });
    return ranges;
}
function combineRanges(ranges) {
    const orderedRanges = ranges
        .map((range, index) => {
        return {
            begin: range.begin,
            end: range.end,
            index,
        };
    })
        .sort((a, b) => {
        return a.begin - b.begin;
    });
    let j = 0;
    let i = 1;
    for (j = 0, i = 1; i < orderedRanges.length; i++) {
        const orderedRange = orderedRanges[i];
        const currentRange = orderedRanges[j];
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
        .sort((a, b) => {
        return a.index - b.index;
    })
        .map((range) => {
        return {
            begin: range.begin,
            end: range.end,
        };
    });
}
exports.combineRanges = combineRanges;
//# sourceMappingURL=RangeUtils.js.map