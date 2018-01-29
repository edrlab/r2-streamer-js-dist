export interface CertificateData {
    trustKey: string;
    trustVal: string;
    private?: string;
    public?: string;
    cert?: string;
}
export declare function generateSelfSignedData(): Promise<CertificateData>;
