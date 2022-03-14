export declare const URL_SIGNED_EXPIRY_QUERY_PARAM_NAME = "r2tkn";
export declare const signExpiringResourceURLs: (rootUrl: string, pathBase64Str: string, jsonObj: any) => void;
export declare const verifyExpiringResourceURL: (queryParamValue: string | undefined, pathBase64Str: string, pathInZip: string) => boolean;
