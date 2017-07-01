import { IPropertyConverter } from "./converter";
export declare class DateConverter implements IPropertyConverter {
    serialize(property: Date): string;
    deserialize(value: string): Date;
    collapseArrayWithSingleItem(): boolean;
}
