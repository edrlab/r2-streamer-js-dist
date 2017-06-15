/// <reference types="node" />
import { IPropertyConverter } from "./converter";
export declare class BufferConverter implements IPropertyConverter {
    private encoding;
    serialize(property: Buffer): string;
    deserialize(value: string): Buffer;
}
