/// <reference types="node" />
export interface CertificateData {
    trustKey: Buffer;
    trustCheck: string;
    trustCheckIV: Buffer;
    private?: string;
    public?: string;
    cert?: string;
}
export declare function generateSelfSignedData(): Promise<CertificateData>;
