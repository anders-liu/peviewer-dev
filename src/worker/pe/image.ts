import * as S from "./structures";
import { WSAEAFNOSUPPORT } from "constants";

export type PEErrorType
    = "INVALID_DATA_POSITION"
    | "INVALID_DOS_SIGNATURE"
    | "INVALID_PE_SIGNATURE"
    ;

export class PEError extends Error {
    constructor(
        public type: PEErrorType,
        public offset?: number,
        public size?: number,
        public struct?: S.StructureID
    ) {
        super(type);
    }
}

export class PEDataPositionError extends PEError {
    constructor(
        public targetPosition: number,
        public targetSize: number,
        public offset?: number,
        public size?: number,
        public struct?: S.StructureID
    ) {
        super("INVALID_DATA_POSITION", offset, size, struct);
    }
}

export class PEImage {
    public static load(buf: ArrayBuffer): PEImage {
        return new PEImage(buf);
    }

    private constructor(buf: ArrayBuffer) {
        this.data = new DataView(buf);
        this.loadHeaders();
    }

    private loadHeaders(): void {
        let offset = 0;
        // dosHeader
        const e_magic = this.data.getUint16(offset, true);
        if (e_magic != IMG.IMAGE_DOS_SIGNATURE) {
            throw <PEError>{};
        }
    }

    private readonly data: DataView;

    private dosHeader: IMG.IMAGE_DOS_HEADER | null = null;
    private peSignature: number | null = null;
    private fileHeader: IMG.IMAGE_FILE_HEADER | null = null;
    private optionalHeader: IMG.IMAGE_OPTIONAL_HEADER | null = null;
    private sectionHeaders: IMG.IMAGE_SECTION_HEADER[] | null = null;
}
