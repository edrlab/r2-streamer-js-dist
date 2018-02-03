export interface CertificateData {
    trustKey: string;
    trustCheck: string;
    private?: string;
    public?: string;
    cert?: string;
}
export declare function generateSelfSignedData(): Promise<CertificateData>;
