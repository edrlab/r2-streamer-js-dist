"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ta_json_1 = require("ta-json");
const metadata_collection_1 = require("./metadata-collection");
class JsonCollectionConverter {
    serialize(property) {
        return ta_json_1.JSON.serialize(property);
    }
    deserialize(value) {
        if (typeof value === "string") {
            const c = new metadata_collection_1.Collection();
            c.Name = value;
            return c;
        }
        else {
            return ta_json_1.JSON.deserialize(value, metadata_collection_1.Collection);
        }
    }
    collapseArrayWithSingleItem() {
        return true;
    }
}
exports.JsonCollectionConverter = JsonCollectionConverter;
//# sourceMappingURL=metadata-collection-json-converter.js.map