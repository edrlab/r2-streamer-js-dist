import { Server } from "../../http/server";
import { Publication } from "../../models/publication";
import { IDeviceIDManager } from "./lsd-deviceid-manager";
export declare function installLsdHandler(publicationsServer: Server, deviceIDManager: IDeviceIDManager): void;
export declare function launchStatusDocumentProcessing(publication: Publication, publicationPath: string, deviceIDManager: IDeviceIDManager, onStatusDocumentProcessingComplete: () => void): Promise<void>;
