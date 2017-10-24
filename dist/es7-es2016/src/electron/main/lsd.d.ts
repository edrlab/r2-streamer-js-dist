import { Publication } from "../../models/publication";
export interface IDeviceIDManager {
    getDeviceNAME(): string;
    getDeviceID(): string;
    checkDeviceID(key: string): string | undefined;
    recordDeviceID(key: string): void;
}
export declare const deviceIDManager: IDeviceIDManager;
export declare function launchStatusDocumentProcessing(publication: Publication, publicationPath: string, _deviceIDManager: IDeviceIDManager, onStatusDocumentProcessingComplete: () => void): Promise<void>;