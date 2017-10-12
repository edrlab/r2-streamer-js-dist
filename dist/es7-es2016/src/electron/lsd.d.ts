import { Publication } from "../../../es8-es2017/src/models/publication";
export interface IDeviceIDManager {
    getDeviceNAME(): string;
    getDeviceID(): string;
    checkDeviceID(key: string): string;
    recordDeviceID(key: string): void;
}
export declare function launchStatusDocumentProcessing(publication: Publication, publicationPath: string, _deviceIDManager: IDeviceIDManager, onStatusDocumentProcessingComplete: () => void): Promise<void>;
