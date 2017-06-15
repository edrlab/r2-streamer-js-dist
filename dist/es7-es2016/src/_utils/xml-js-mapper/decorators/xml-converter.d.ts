import { IPropertyConverter } from "../converters/converter";
import { IParameterlessConstructor } from "../types";
export declare function XmlConverter(converter: IPropertyConverter | IParameterlessConstructor<IPropertyConverter>): (target: any, key: string) => void;
