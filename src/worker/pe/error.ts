export const enum PEErrorType {
    INVALID_DATA_POSITION = "INVALID_DATA_POSITION",
    INVALID_DOS_SIGNATURE = "INVALID_DOS_SIGNATURE",
    INVALID_PE_SIGNATURE = "INVALID_PE_SIGNATURE",
    INVALID_OPTIONAL_HEADER_MAGIC = "INVALID_OPTIONAL_HEADER_MAGIC",
    INVALID_DATA_DIRECTORY_COUNT = "INVALID_DATA_DIRECTORY_COUNT",
}

export class PEError extends Error {
    constructor(
        public type: PEErrorType,
        public offset?: number,
        public size?: number
    ) {
        super(type);
    }
}
