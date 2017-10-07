import { FunctionType } from "../types";
export interface IPropertyConverter {
    serialize(property: any): string;
    deserialize(value: string): any;
}
export declare const propertyConverters: Map<FunctionType, IPropertyConverter>;
