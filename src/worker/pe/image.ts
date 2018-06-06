import * as S from "./structures";
import * as L from "./loader";
import * as F from "./image-flags";
import * as E from "./error";

export class PEImage implements L.FileDataProvider {
    public static load(buf: ArrayBuffer): PEImage {
        return new PEImage(buf);
    }

    //
    // FileDataProvider functions.
    //

    public getU1(p: number): number {
        this.check(p, 1);
        return this.data.getUint8(p);
    }

    public getU2(p: number): number {
        this.check(p, 2);
        return this.data.getUint16(p, true);
    }

    public getU4(p: number): number {
        this.check(p, 3);
        return this.data.getUint32(p, true);
    }

    public getData(p: number, sz: number): Uint8Array {
        this.check(p, sz);
        return new Uint8Array(this.data.buffer.slice(p, p + sz));
    }

    //
    // Image attributes.
    //

    public is32Bit(): boolean | undefined {
        const optHdr = this.getOptionalHeader();
        if (optHdr == null) {
            return undefined;
        }

        switch (optHdr.Magic.value) {
            case F.IMAGE_NT_OPTIONAL_HDR32_MAGIC: return true;
            case F.IMAGE_NT_OPTIONAL_HDR64_MAGIC: return false;
            default: return undefined;
        }
    }

    public isManaged(): boolean {
        const dd = this.getDataDirectories();
        return dd != null && this.isDataDirectoryValid(
            dd.items[F.ImageDirectoryEntry.IMAGE_DIRECTORY_ENTRY_COM_DESCRIPTOR]
        );
    }

    public hasMetadata(): boolean {
        const h = this.getCliHeader();
        return h != null && this.isDataDirectoryValid(h.MetaData);
    }

    public hasManagedResources(): boolean {
        const h = this.getCliHeader();
        return h != null && this.isDataDirectoryValid(h.Resources);
    }

    public hasStrongNameSignature(): boolean {
        const h = this.getCliHeader();
        return h != null && this.isDataDirectoryValid(h.StrongNameSignature);
    }

    //
    // Image headers.
    //

    public getDosHeader(): S.ImageDosHeader | undefined {
        return this.dosHeader;
    }

    public getPESignature(): S.U4Field | undefined {
        return this.peSignature;
    }

    public getFileHeader(): S.ImageFileHeader | undefined {
        return this.fileHeader;
    }

    public getOptionalHeader(): S.ImageOptionalHeader32 | S.ImageOptionalHeader64 | undefined {
        return this.optionalHeader;
    }

    public getDataDirectories(): S.StructArray<S.ImageDataDirectory> | undefined {
        return this.dataDirectories;
    }

    public getSectionHeaders(): S.StructArray<S.ImageSectionHeader> | undefined {
        return this.sectionHeaders;
    }

    //
    // Metadata structures.
    //

    public getCliHeader(): S.CliHeader | undefined {
        if (this.cliHeader) return this.cliHeader;
        if (!this.isManaged()) return undefined;

        const offset = this.rvaToOffset(this.dataDirectories!
            .items[F.ImageDirectoryEntry.IMAGE_DIRECTORY_ENTRY_COM_DESCRIPTOR]
            .VirtualAddress.value);

        this.cliHeader = L.loadCliHeader(this, offset);
        return this.cliHeader;
    }

    public getMetadataRoot(): S.MetadataRoot | undefined {
        if (this.metadataRoot) return this.metadataRoot;

        const cliHeader = this.getCliHeader();
        if (!cliHeader) return undefined;

        const offset = this.rvaToOffset(cliHeader.MetaData.VirtualAddress.value);
        if (!offset) return undefined;

        this.metadataRoot = L.loadMetadataRoot(this, offset);
        return this.metadataRoot;
    }

    public getMetadataStreamHeaders(): S.StructArray<S.MetadataStreamHeader> | undefined {
        if (this.metadataStreamHeaders) return this.metadataStreamHeaders;

        const mdRoot = this.getMetadataRoot();
        if (!mdRoot || !mdRoot.Streams.value) return undefined;

        this.metadataStreamHeaders = L.loadStructArrayByCount(
            this,
            mdRoot._offset + mdRoot._size,
            L.loadMetadataStreamHeader,
            mdRoot.Streams.value
        );
        return this.metadataStreamHeaders;
    }

    public getStrongNameSignature(): S.Field | undefined {
        if (this.strongNameSignature) return this.strongNameSignature;

        const cliHeader = this.getCliHeader();
        if (!cliHeader) return undefined;

        const offset = this.rvaToOffset(cliHeader.StrongNameSignature.VirtualAddress.value);
        if (!offset) return undefined;

        this.strongNameSignature = L.loadFixedSizeByteArrayField(
            this, offset,
            cliHeader.StrongNameSignature.Size.value);
        return this.strongNameSignature;
    }

    //
    // Utilities.
    //

    public rvaToOffset(rva: number): number {
        const sh = this.getSectionHeaderByRva(rva);
        if (!sh) return 0;

        return rva - sh.VirtualAddress.value + sh.PointerToRawData.value;
    }

    public offsetToRva(offset: number): number {
        const sh = this.getSectionHeaderByOffset(offset);
        if (!sh) return 0;

        return offset - sh.PointerToRawData.value + sh.VirtualAddress.value;
    }

    //
    // Private implementations.
    //

    private check(p: number, sz: number): void {
        if (p < 0 || p >= this.data.byteLength
            || sz < 0 || p + sz > this.data.byteLength) {
            throw new E.PEError(E.PEErrorType.INVALID_DATA_POSITION, p, sz);
        }
    }

    private constructor(buf: ArrayBuffer) {
        this.data = new DataView(buf);
        this.loadHeaders();
    }

    private loadHeaders(): void {
        let ptr = 0;
        this.dosHeader = L.loadImageDosHeader(this, ptr);

        if (this.dosHeader.e_magic.value != F.IMAGE_DOS_SIGNATURE) {
            throw new E.PEError(E.PEErrorType.INVALID_DOS_SIGNATURE, ptr, 2);
        }

        ptr = this.dosHeader.e_lfanew.value;
        this.peSignature = L.loadU4Field(this, ptr);

        if (this.peSignature.value != F.IMAGE_NT_SIGNATURE) {
            throw new E.PEError(E.PEErrorType.INVALID_PE_SIGNATURE, ptr, 4);
        }

        ptr += this.peSignature._size;
        this.fileHeader = L.loadImageFileHeader(this, ptr);

        ptr += this.fileHeader._size;
        const magic = L.loadU2Field(this, ptr);
        switch (magic.value) {
            case F.IMAGE_NT_OPTIONAL_HDR32_MAGIC:
                this.optionalHeader = L.loadImageOptionalHeader32(this, ptr);
                break;
            case F.IMAGE_NT_OPTIONAL_HDR64_MAGIC:
                this.optionalHeader = L.loadImageOptionalHeader64(this, ptr);
                break;
            default:
                throw new E.PEError(E.PEErrorType.INVALID_OPTIONAL_HEADER_MAGIC, ptr, 2);
        }

        if (this.optionalHeader.NumberOfRvaAndSizes.value != F.IMAGE_NUMBEROF_DIRECTORY_ENTRIES) {
            throw new E.PEError(E.PEErrorType.INVALID_DATA_DIRECTORY_COUNT,
                this.optionalHeader.NumberOfRvaAndSizes._offset,
                this.optionalHeader.NumberOfRvaAndSizes._size);
        }

        ptr += this.optionalHeader._size;
        this.dataDirectories = L.loadStructArrayByCount(this, ptr,
            L.loadImageDataDirectory,
            this.optionalHeader.NumberOfRvaAndSizes.value);

        ptr += this.dataDirectories._size;
        this.sectionHeaders = L.loadStructArrayByCount(this, ptr,
            L.loadImageSectionHeader,
            this.fileHeader.NumberOfSections.value);
    }

    private getSectionHeaderByOffset(offset: number): S.ImageSectionHeader | undefined {
        return this.sectionHeaders && this.sectionHeaders.items.filter(h => {
            const p = h.PointerToRawData.value;
            const sz = h.SizeOfRawData.value;
            return offset >= p && offset < p + sz;
        }).shift();
    }

    private getSectionHeaderByRva(rva: number): S.ImageSectionHeader | undefined {
        return this.sectionHeaders && this.sectionHeaders.items.filter(h => {
            const p = h.VirtualAddress.value;
            const sz = h.VirtualSize.value;
            return rva >= p && rva < p + sz;
        }).shift();
    }

    private isDataDirectoryValid(dd?: S.ImageDataDirectory): boolean {
        return (dd && dd.VirtualAddress.value > 0 && dd.Size.value > 0) || false;
    }

    private readonly data: DataView;

    private dosHeader?: S.ImageDosHeader;
    private peSignature?: S.U4Field;
    private fileHeader?: S.ImageFileHeader;
    private optionalHeader?: S.ImageOptionalHeader32 | S.ImageOptionalHeader64;
    private dataDirectories?: S.StructArray<S.ImageDataDirectory>;
    private sectionHeaders?: S.StructArray<S.ImageSectionHeader>;

    private cliHeader?: S.CliHeader;
    private metadataRoot?: S.MetadataRoot;
    private metadataStreamHeaders?: S.StructArray<S.MetadataStreamHeader>;
    private strongNameSignature?: S.Field;
}
