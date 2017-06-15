export interface IXPathSelectorItem {
    isAttribute: boolean;
    isText: boolean;
    localName: string;
    namespacePrefix: string | undefined;
    namespaceUri: string | undefined;
}
export interface IParameterlessConstructor<T> {
    name?: string;
    new (): T;
}
export interface IDynamicObject {
    constructor: FunctionType;
    [name: string]: any;
}
export interface IParseOptions {
    runConstructor?: boolean;
}
export declare type FunctionType = any;
export interface IXmlNamespaces {
    [ns: string]: string;
}
