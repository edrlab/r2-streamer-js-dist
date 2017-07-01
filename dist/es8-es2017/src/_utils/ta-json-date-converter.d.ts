import { IPropertyConverter, JsonValue } from "ta-json";
export declare class JsonDateConverter implements IPropertyConverter {
    serialize(property: Date): JsonValue;
    deserialize(value: JsonValue): Date;
    collapseArrayWithSingleItem(): boolean;
}
