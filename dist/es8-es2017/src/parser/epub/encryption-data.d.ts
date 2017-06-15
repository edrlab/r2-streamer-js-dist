import { CipherData } from "./encryption-cypherdata";
import { KeyInfo } from "./encryption-keyinfo";
import { EncryptionMethod } from "./encryption-method";
import { EncryptionProperty } from "./encryption-property";
export declare class EncryptedData {
    EncryptionMethod: EncryptionMethod;
    KeyInfo: KeyInfo;
    CipherData: CipherData;
    EncryptionProperties: EncryptionProperty[];
}
