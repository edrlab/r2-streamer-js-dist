import { IPropertyConverter, JsonValue } from "ta-json";
import { Contributor } from "./metadata-contributor";
export declare class JsonContributorConverter implements IPropertyConverter {
    serialize(property: Contributor): JsonValue;
    deserialize(value: JsonValue): Contributor;
    collapseArrayWithSingleItem(): boolean;
}
