import "reflect-metadata";
import { IXmlNamespaces } from "../types";
export declare function XmlXPathSelector(selector: string, namespaces?: IXmlNamespaces): (target: any, key: string) => void;
