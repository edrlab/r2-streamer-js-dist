export interface JsonSchemaValidationError {
    ajvSchemaPath: string;
    ajvDataPath?: string;
    ajvMessage: string;
    jsonPath?: string;
}
export declare function jsonSchemaValidate(jsonSchemasRootpath: string, jsonSchemasNames: string[], jsonToValidate: any): JsonSchemaValidationError[] | undefined;
