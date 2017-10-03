import { IPropertyConverter, JsonValue } from "ta-json";
export declare class JsonStringConverter implements IPropertyConverter {
    serialize(property: string): JsonValue;
    deserialize(value: JsonValue): string;
    collapseArrayWithSingleItem(): boolean;
}
