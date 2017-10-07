import { FunctionType, IParseOptions } from "./types";
export declare class XML {
    static deserialize<T>(objectInstance: Document | Element, objectType?: FunctionType, options?: IParseOptions): T;
}
