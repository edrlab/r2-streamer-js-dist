"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ta_json_1 = require("ta-json");
const metadata_contributor_1 = require("./metadata-contributor");
class JsonContributorConverter {
    serialize(property) {
        return ta_json_1.JSON.serialize(property);
    }
    deserialize(value) {
        if (typeof value === "string") {
            const c = new metadata_contributor_1.Contributor();
            c.Name = value;
            return c;
        }
        else {
            return ta_json_1.JSON.deserialize(value, metadata_contributor_1.Contributor);
        }
    }
    collapseArrayWithSingleItem() {
        return true;
    }
}
exports.JsonContributorConverter = JsonContributorConverter;
//# sourceMappingURL=metadata-contributor-json-converter.js.map