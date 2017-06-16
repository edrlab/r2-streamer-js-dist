import { FunctionType, IXmlNamespaces } from "../types";
import { PropertyDefinition } from "./property-definition";
export declare class ObjectDefinition {
    ctr: () => void;
    beforeDeserialized: () => void;
    onDeserialized: () => void;
    discriminatorProperty: string;
    discriminatorValue: any;
    properties: Map<string, PropertyDefinition>;
    namespaces: IXmlNamespaces | undefined;
    constructor();
    getProperty(key: string): PropertyDefinition;
}
export declare const objectDefinitions: Map<FunctionType, ObjectDefinition>;
export declare function getDefinition(objectType: FunctionType): ObjectDefinition;
export declare function getInheritanceChain(objectType: object): FunctionType[];
export declare function getTypedInheritanceChain(objectType: FunctionType, objectInstance?: Node): FunctionType[];
