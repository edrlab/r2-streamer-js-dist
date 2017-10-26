import { IPropertyConverter } from "../converters/converter";
import { FunctionType, IXmlNamespaces, IXPathSelectorItem } from "../types";
export declare class PropertyDefinition {
    objectType: FunctionType | undefined;
    array: boolean;
    set: boolean;
    readonly: boolean;
    writeonly: boolean;
    converter: IPropertyConverter | undefined;
    xpathSelector: string;
    xpathSelectorParsed: IXPathSelectorItem[];
    namespaces: IXmlNamespaces | undefined;
}
