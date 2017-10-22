/// <reference types="node" />
import { Encryption } from "./lcp-encryption";
import { Link } from "./lcp-link";
import { Rights } from "./lcp-rights";
import { Signature } from "./lcp-signature";
import { User } from "./lcp-user";
export declare function setLcpNativePluginPath(filepath: string): boolean;
export declare class LCP {
    ID: string;
    Provider: string;
    Issued: Date;
    Updated: Date;
    Encryption: Encryption;
    Rights: Rights;
    User: User;
    Signature: Signature;
    Links: Link[];
    ZipPath: string;
    JsonSource: string;
    ContentKey: Buffer | undefined;
    private _usesNativeNodePlugin;
    private _lcpNative;
    private _lcpContext;
    private userPassphraseHex;
    isNativeNodePlugin(): boolean;
    isReady(): boolean;
    init(): void;
    decrypt(encryptedContent: Buffer): Promise<Buffer>;
    setUserPassphrase(pass: string): Promise<boolean>;
}
