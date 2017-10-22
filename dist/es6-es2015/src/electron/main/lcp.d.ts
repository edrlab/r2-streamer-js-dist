import { Server } from "../../http/server";
export declare function installLcpHandler(_publicationsServer: Server): void;
export declare function downloadFromLCPL(filePath: string, dir: string, destFileName: string): Promise<string[]>;
