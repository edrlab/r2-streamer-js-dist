"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ta_json_1 = require("ta-json");
var metadata_contributor_1 = require("./metadata-contributor");
var JsonContributorConverter = (function () {
    function JsonContributorConverter() {
    }
    JsonContributorConverter.prototype.serialize = function (property) {
        return ta_json_1.JSON.serialize(property);
    };
    JsonContributorConverter.prototype.deserialize = function (value) {
        if (typeof value === "string") {
            var c = new metadata_contributor_1.Contributor();
            c.Name = value;
            return c;
        }
        else {
            return ta_json_1.JSON.deserialize(value, metadata_contributor_1.Contributor);
        }
    };
    JsonContributorConverter.prototype.collapseArrayWithSingleItem = function () {
        return true;
    };
    return JsonContributorConverter;
}());
exports.JsonContributorConverter = JsonContributorConverter;
//# sourceMappingURL=metadata-contributor-json-converter.js.map