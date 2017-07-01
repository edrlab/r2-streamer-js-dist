"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ta_json_1 = require("ta-json");
var metadata_collection_1 = require("./metadata-collection");
var JsonCollectionConverter = (function () {
    function JsonCollectionConverter() {
    }
    JsonCollectionConverter.prototype.serialize = function (property) {
        return ta_json_1.JSON.serialize(property);
    };
    JsonCollectionConverter.prototype.deserialize = function (value) {
        if (typeof value === "string") {
            var c = new metadata_collection_1.Collection();
            c.Name = value;
            return c;
        }
        else {
            return ta_json_1.JSON.deserialize(value, metadata_collection_1.Collection);
        }
    };
    JsonCollectionConverter.prototype.collapseArrayWithSingleItem = function () {
        return true;
    };
    return JsonCollectionConverter;
}());
exports.JsonCollectionConverter = JsonCollectionConverter;
//# sourceMappingURL=metadata-collection-json-converter.js.map