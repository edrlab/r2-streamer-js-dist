export interface CertificateData {
    trustKey: string;
    trustVal: string;
    clientprivate?: string;
    clientpublic?: string;
    clientcert?: string;
    private?: string;
    public?: string;
    cert?: string;
}
export declare function generateSelfSignedData(): Promise<CertificateData>;
