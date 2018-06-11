import * as F from "./image-flags";

export interface MetadataTableInfo {
    [key: number /* F.MetadataTableIndex */]: {
        valid: boolean;
        sorted: boolean;
        rows: number;
        idSize: number;
        baseOffset: number;
        rowSize: number;
    }
}

