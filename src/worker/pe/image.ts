import * as S from "./structures";
import * as A from "./aux-structures";
import * as L from "./loader";
import * as F from "./image-flags";
import * as E from "./error";
import * as U from "./utils";

export class PEImage implements L.FileDataProvider, L.MetadataSizingProvider {
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

    public isMetadataTableValid(id: F.MetadataTableIndex): boolean {
        const info = this.metadataTableInfo;
        if (info && info[id]) {
            return info[id].valid;
        } else {
            return false;
        }
    }

    public isMetadataTableSorted(id: F.MetadataTableIndex): boolean {
        const info = this.metadataTableInfo;
        if (info && info[id]) {
            return info[id].sorted;
        } else {
            return false;
        }
    }

    public getMetadataTableRows(id: F.MetadataTableIndex): number {
        const info = this.metadataTableInfo;
        if (info && info[id]) {
            return info[id].rows;
        } else {
            return 0;
        }
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

    public getMetadataStreamHeader(name: F.MetadataStreamName): S.MetadataStreamHeader | undefined {
        const headers = this.getMetadataStreamHeaders();
        if (!headers) return undefined;

        return headers.items.filter(v => v.Name.value == name).shift();
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

    public getMetadataTableHeader(): S.MetadataTableHeader | undefined {
        if (this.metadataTableHeader) return this.metadataTableHeader;

        const mdRoot = this.getMetadataRoot();
        if (!mdRoot) return undefined;

        const sh = this.getMetadataStreamHeader(F.MetadataStreamName.Table);
        if (!sh) return undefined;

        const offset = mdRoot._offset + sh.Offset.value;
        this.metadataTableHeader = L.loadMetadataTableHeader(this, offset);
        this.fillMetadataTableInfo();
        this.fillMetadataTableInfoExtra();

        return this.metadataTableHeader;
    }

    public getMdsStringsItem(offset: number): S.StringField | undefined {
        const mdRoot = this.getMetadataRoot();
        if (!mdRoot) return undefined;

        const sh = this.getMetadataStreamHeader(F.MetadataStreamName.Strings);
        if (!sh) return undefined;

        if (offset < 0 || offset >= sh.Size.value) {
            return undefined;
        } else {
            return L.loadNullTerminatedStringField(this,
                mdRoot._offset + sh.Offset.value + offset);
        }
    }

    public getMdsUSItem(offset: number): S.MetadataUSItem | undefined {
        const mdRoot = this.getMetadataRoot();
        if (!mdRoot) return undefined;

        const sh = this.getMetadataStreamHeader(F.MetadataStreamName.US);
        if (!sh) return undefined;

        if (offset < 0 || offset >= sh.Size.value) {
            return undefined;
        } else {
            return L.loadMetadataUSItem(this,
                mdRoot._offset + sh.Offset.value + offset);
        }
    }

    public getMdsGuidItems(): S.StructArray<S.Field> | undefined {
        const mdRoot = this.getMetadataRoot();
        if (!mdRoot) return undefined;

        const sh = this.getMetadataStreamHeader(F.MetadataStreamName.GUID);
        if (!sh) return undefined;

        const count = sh.Size.value / 16;
        return L.loadStructArrayByCount(
            this,
            mdRoot._offset + sh.Offset.value,
            (d, p) => L.loadFixedSizeByteArrayField(d, p, 16),
            count);
    }

    public getMdsBlobItem(offset: number): S.MetadataBlobItem | undefined {
        const mdRoot = this.getMetadataRoot();
        if (!mdRoot) return undefined;

        const sh = this.getMetadataStreamHeader(F.MetadataStreamName.Blob);
        if (!sh) return undefined;

        if (offset < 0 || offset >= sh.Size.value) {
            return undefined;
        } else {
            return L.loadMetadataBlobItem(this,
                mdRoot._offset + sh.Offset.value + offset);
        }
    }

    //
    // Metadata sizing.
    //

    public getHeapSize(heap: F.MetadataHeapSizeID): number {
        if (this.metadataSizingCache.heap) {
            return this.metadataSizingCache.heap[heap];
        }

        const h = this.getMetadataTableHeader();
        if (!h) return 0;

        const getHeapSizeFunc = (heap: F.MetadataHeapSizeID) =>
            (h.HeapSizes.value & (1 << heap)) != 0 ? 4 : 2;

        this.metadataSizingCache.heap = [
            F.MetadataHeapSizeID.String,
            F.MetadataHeapSizeID.GUID,
            F.MetadataHeapSizeID.Blob]
            .map(v => (h.HeapSizes.value & (1 << v)) != 0 ? 4 : 2);

        return this.metadataSizingCache.heap[heap];
    }

    public getTableIDSize(t: F.MetadataTableIndex): number {
        const info = this.metadataTableInfo;
        if (info && info[t]) {
            return info[t].idSize;
        } else {
            return 0;
        }
    }

    public getCodedTokenSize(t: F.MetadataCodedTokenIndex): number {
        if (this.metadataSizingCache.codedToken) {
            return this.metadataSizingCache.codedToken[t];
        }

        this.metadataSizingCache.codedToken = F.ctc.map(c => {
            const maxRows = 0xFFFF >> c.tagSize;
            for (let tid of c.tables) {
                if (this.getMetadataTableRows(tid) > maxRows) {
                    return 4;
                }
            }
            return 2;
        });

        return this.metadataSizingCache.codedToken[t];
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

    private fillMetadataTableInfo(): void {
        const h = this.metadataTableHeader;
        if (!h) return;

        let info: A.MetadataTableInfo = {};
        let nValid = 0;
        for (let id = 0; id < F.NumberOfMdTables; id++) {
            const valid = U.isSetLong(h.Valid.high, h.Valid.low, id);
            const sorted = U.isSetLong(h.Sorted.high, h.Sorted.low, id);
            const rows = valid ? h.Rows.items[nValid++].value : 0;
            info[id] = {
                valid,
                sorted,
                rows,
                idSize: valid ? (rows > 0xFFFF ? 4 : 2) : 0,
                baseOffset: 0,
                rowSize: 0
            };
        }
        this.metadataTableInfo = info;
    }

    private fillMetadataTableInfoExtra(): void {
        const h = this.metadataTableHeader;
        if (!h) return;

        const ti = this.metadataTableInfo;
        if (!ti) return;

        const ctid = F.MetadataCodedTokenIndex;
        const ctsz = this.getCodedTokenSize;

        const tid = F.MetadataTableIndex;

        const stringsSize = this.getHeapSize(F.MetadataHeapSizeID.String);
        const guidSize = this.getHeapSize(F.MetadataHeapSizeID.GUID);
        const blobSize = this.getHeapSize(F.MetadataHeapSizeID.Blob);

        let baseOffset = h._offset + h._size;

        let tbli = ti[tid.Module];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + stringsSize + 3 * guidSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.TypeRef];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ctsz(ctid.ResolutionScope) + 2 * stringsSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.TypeDef];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + 2 * stringsSize + ctsz(ctid.TypeDefOrRef) + ti[tid.Field].idSize + ti[tid.MethodDef].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.FieldPtr];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.Field].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.Field];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + stringsSize + blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.MethodPtr];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.MethodDef].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.MethodDef];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + 2 + 2 + stringsSize + blobSize + ti[tid.Param].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.ParamPtr];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.Param].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.Param];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + 2 + stringsSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.InterfaceImpl];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.TypeDef].idSize + ctsz(ctid.TypeDefOrRef);
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.MemberRef];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ctsz(ctid.MemberRefParent) + stringsSize + blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.Constant];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 1 + 1 + ctsz(ctid.HasConstant) + blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.CustomAttribute];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ctsz(ctid.HasCustomAttribute) + ctsz(ctid.CustomAttributeType) + blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.FieldMarshal];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ctsz(ctid.HasFieldMarshall) + blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.DeclSecurity];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + ctsz(ctid.HasDeclSecurity) + blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.ClassLayout];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + 4 + ti[tid.TypeDef].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.FieldLayout];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + ti[tid.Field].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.StandAloneSig];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.EventMap];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.TypeDef].idSize + ti[tid.Event].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.EventPtr];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.Event].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.Event];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + stringsSize + ctsz(ctid.TypeDefOrRef);
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.PropertyMap];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.TypeDef].idSize + ti[tid.Property].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.PropertyPtr];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.Property].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.Property];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + stringsSize + blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.MethodSemantics];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + ti[tid.MethodDef].idSize + ctsz(ctid.HasSemantics);
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.MethodImpl];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.TypeDef].idSize + 2 * ctsz(ctid.MethodDefOrRef);
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.ModuleRef];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = stringsSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.TypeSpec];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.ImplMap];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + ctsz(ctid.MemberForwarded) + stringsSize + ti[tid.ModuleRef].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.FieldRVA];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + ti[tid.Field].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.ENCLog];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + 4;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.ENCMap];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.Assembly];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + 2 + 2 + 2 + 2 + 4 + blobSize + 2 * stringsSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.AssemblyProcessor];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.AssemblyOS];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + 4 + 4;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.AssemblyRef];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + 2 + 2 + 2 + 4 + 2 * blobSize + 2 * stringsSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.AssemblyRefProcessor];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + ti[tid.AssemblyRef].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.AssemblyRefOS];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + 4 + 4 + ti[tid.AssemblyRef].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.File];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + stringsSize + blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.ExportedType];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + 4 + 2 * stringsSize + ctsz(ctid.Implementation);
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.ManifestResource];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 4 + 4 + stringsSize + ctsz(ctid.Implementation);
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.NestedClass];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 * ti[tid.TypeDef].idSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.GenericParam];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = 2 + 2 + ctsz(ctid.TypeOrMethodDef) + stringsSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.MethodSpec];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ctsz(ctid.MethodDefOrRef) + blobSize;
        }
        baseOffset += tbli.rows * tbli.rowSize;

        tbli = ti[tid.GenericParamConstraint];
        if (tbli.valid) {
            tbli.baseOffset = baseOffset;
            tbli.rowSize = ti[tid.GenericParam].idSize + ctsz(ctid.TypeDefOrRef);
        }
        baseOffset += tbli.rows * tbli.rowSize;
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

    private metadataTableHeader?: S.MetadataTableHeader;
    private metadataTableInfo?: A.MetadataTableInfo;

    private metadataSizingCache: {
        heap?: {
            [key: number /* F.MetadataHeapSizeID */]: number;
        };
        codedToken?: {
            [key: number /* F.MetadataCodedTokenIndex */]: number;
        }
    } = {};
}
