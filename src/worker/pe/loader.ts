import * as S from "./structures";
import * as F from "./image-flags";
import * as U from "./utils";

export interface FileDataProvider {
    getU1(p: number): number;
    getU2(p: number): number;
    getU4(p: number): number;
    getData(p: number, sz: number): Uint8Array;
}

export interface MetadataSizingProvider {
    getHeapSize(heap: F.MetadataHeapSizeID): number;
    getTableIDSize(t: F.MetadataTableIndex): number;
    getCodedTokenSize(t: F.MetadataCodedTokenIndex): number;
}

//
// Basic structures.
//

export function loadU1Field(d: FileDataProvider, p: number): S.U1Field {
    return {
        _offset: p, _size: 1, data: d.getData(p, 1), value: d.getU1(p)
    };
}

export function loadU2Field(d: FileDataProvider, p: number): S.U2Field {
    return {
        _offset: p, _size: 2, data: d.getData(p, 2), value: d.getU2(p)
    };
}

export function loadU4Field(d: FileDataProvider, p: number): S.U4Field {
    return {
        _offset: p, _size: 4, data: d.getData(p, 4), value: d.getU4(p)
    };
}

export function loadU8Field(d: FileDataProvider, p: number): S.U8Field {
    const low = d.getU4(p);
    const high = d.getU4(p + 4);

    return {
        _offset: p, _size: 8, data: d.getData(p, 8), low, high
    };
}

export function loadCompressedUIntField(d: FileDataProvider, p: number): S.CompressedUIntField {
    const sz = U.getCompressedIntSize(d.getU1(p));
    const data = new Uint8Array(d.getData(p, sz));
    const value = U.decompressUint(data);

    return { _offset: p, _size: sz, data, value };
}

export function loadU1EnumField<T>(d: FileDataProvider, p: number): S.U1EnumField<T> {
    return {
        _offset: p, _size: 1, data: d.getData(p, 1), value: d.getU1(p) as any as T
    };
}

export function loadU2EnumField<T>(d: FileDataProvider, p: number): S.U2EnumField<T> {
    return {
        _offset: p, _size: 2, data: d.getData(p, 2), value: d.getU2(p) as any as T
    };
}

export function loadU4EnumField<T>(d: FileDataProvider, p: number): S.U4EnumField<T> {
    return {
        _offset: p, _size: 4, data: d.getData(p, 4), value: d.getU4(p) as any as T
    };
}

export function loadFixedSizeByteArrayField(d: FileDataProvider, p: number, sz: number): S.Field {
    return {
        _offset: p, _size: sz, data: d.getData(p, sz)
    };
}

export function loadFixedSizeAsciiStringField(d: FileDataProvider, p: number, sz: number): S.StringField {
    const data = d.getData(p, sz);
    const value = String.fromCharCode.apply(null, Array.from(data).filter(v => v != 0));

    return {
        _offset: p, _size: sz, data, value
    };
}

export function loadNullTerminatedStringField(d: FileDataProvider, p: number): S.StringField {
    let bytes: number[] = [];
    let ptr = p;
    let b: number;

    do {
        b = d.getU1(ptr++);
        bytes.push(b);
    } while (b != 0);
    const str = bytes.slice(0, bytes.length - 1).map(v => `%${v.toString(16)}`).join("");
    const value = decodeURIComponent(str);

    return {
        _offset: p, _size: ptr - p, data: Uint8Array.from(bytes), value
    };
}

export function loadFixedSizeUnicodeStringField(d: FileDataProvider, p: number, sz: number): S.StringField {
    const data = d.getData(p, sz);
    const arr = new Uint16Array(data.buffer);
    const value = String.fromCodePoint.apply(null, arr);

    return {
        _offset: p, _size: sz, data, value
    };
}

export function loadStructArrayByCount<T extends S.FileData>(
    d: FileDataProvider,
    p: number,
    loader: (d: FileDataProvider, p: number) => T,
    count: number): S.StructArray<T> {

    let items: T[] = [];
    let ptr = p;
    for (let i = 0; i < count; i++) {
        const s = loader(d, ptr);
        items.push(s);
        ptr += s._size;
    }

    return { _offset: p, _size: ptr - p, items };
}

//
// Image headers.
//

export function loadImageDosHeader(d: FileDataProvider, p: number): S.ImageDosHeader {
    let ptr = p;

    const e_magic = loadU2Field(d, ptr);
    ptr += e_magic._size;

    const e_cblp = loadU2Field(d, ptr);
    ptr += e_cblp._size;

    const e_cp = loadU2Field(d, ptr);
    ptr += e_cp._size;

    const e_crlc = loadU2Field(d, ptr);
    ptr += e_crlc._size;

    const e_cparhdr = loadU2Field(d, ptr);
    ptr += e_cparhdr._size;

    const e_minalloc = loadU2Field(d, ptr);
    ptr += e_minalloc._size;

    const e_maxalloc = loadU2Field(d, ptr);
    ptr += e_maxalloc._size;

    const e_ss = loadU2Field(d, ptr);
    ptr += e_ss._size;

    const e_sp = loadU2Field(d, ptr);
    ptr += e_sp._size;

    const e_csum = loadU2Field(d, ptr);
    ptr += e_csum._size;

    const e_ip = loadU2Field(d, ptr);
    ptr += e_ip._size;

    const e_cs = loadU2Field(d, ptr);
    ptr += e_cs._size;

    const e_lfarlc = loadU2Field(d, ptr);
    ptr += e_lfarlc._size;

    const e_ovno = loadU2Field(d, ptr);
    ptr += e_ovno._size;

    const e_res = loadFixedSizeByteArrayField(d, ptr, 4 * 2);
    ptr += e_res._size;

    const e_oemid = loadU2Field(d, ptr);
    ptr += e_oemid._size;

    const e_oeminfo = loadU2Field(d, ptr);
    ptr += e_oeminfo._size;

    const e_res2 = loadFixedSizeByteArrayField(d, ptr, 10 * 2);
    ptr += e_res2._size;

    const e_lfanew = loadU4Field(d, ptr);
    ptr += e_lfanew._size;

    return {
        _offset: p, _size: ptr - p,
        e_magic,
        e_cblp,
        e_cp,
        e_crlc,
        e_cparhdr,
        e_minalloc,
        e_maxalloc,
        e_ss,
        e_sp,
        e_csum,
        e_ip,
        e_cs,
        e_lfarlc,
        e_ovno,
        e_res,
        e_oemid,
        e_oeminfo,
        e_res2,
        e_lfanew,
    };
}

export function loadImageFileHeader(d: FileDataProvider, p: number): S.ImageFileHeader {
    let ptr = p;

    const Machine = loadU2Field(d, ptr);
    ptr += Machine._size;

    const NumberOfSections = loadU2Field(d, ptr);
    ptr += NumberOfSections._size;

    const TimeDateStamp = loadU4Field(d, ptr);
    ptr += TimeDateStamp._size;

    const PointerToSymbolTable = loadU4Field(d, ptr);
    ptr += PointerToSymbolTable._size;

    const NumberOfSymbols = loadU4Field(d, ptr);
    ptr += NumberOfSymbols._size;

    const SizeOfOptionalHeader = loadU2Field(d, ptr);
    ptr += SizeOfOptionalHeader._size;

    const Characteristics = loadU2EnumField<F.ImageFile>(d, ptr);
    ptr += Characteristics._size;

    return {
        _offset: p, _size: ptr - p,
        Machine,
        NumberOfSections,
        TimeDateStamp,
        PointerToSymbolTable,
        NumberOfSymbols,
        SizeOfOptionalHeader,
        Characteristics,
    };
}

export function loadImageOptionalHeader32(d: FileDataProvider, p: number): S.ImageOptionalHeader32 {
    let ptr = p;

    const Magic = loadU2Field(d, ptr);
    ptr += Magic._size;

    const MajorLinkerVersion = loadU1Field(d, ptr);
    ptr += MajorLinkerVersion._size;

    const MinorLinkerVersion = loadU1Field(d, ptr);
    ptr += MinorLinkerVersion._size;

    const SizeOfCode = loadU4Field(d, ptr);
    ptr += SizeOfCode._size;

    const SizeOfInitializedData = loadU4Field(d, ptr);
    ptr += SizeOfInitializedData._size;

    const SizeOfUninitializedData = loadU4Field(d, ptr);
    ptr += SizeOfUninitializedData._size;

    const AddressOfEntryPoint = loadU4Field(d, ptr);
    ptr += AddressOfEntryPoint._size;

    const BaseOfCode = loadU4Field(d, ptr);
    ptr += BaseOfCode._size;

    const BaseOfData = loadU4Field(d, ptr);
    ptr += BaseOfData._size;

    const ImageBase = loadU4Field(d, ptr);
    ptr += ImageBase._size;

    const SectionAlignment = loadU4Field(d, ptr);
    ptr += SectionAlignment._size;

    const FileAlignment = loadU4Field(d, ptr);
    ptr += FileAlignment._size;

    const MajorOperatingSystemVersion = loadU2Field(d, ptr);
    ptr += MajorOperatingSystemVersion._size;

    const MinorOperatingSystemVersion = loadU2Field(d, ptr);
    ptr += MinorOperatingSystemVersion._size;

    const MajorImageVersion = loadU2Field(d, ptr);
    ptr += MajorImageVersion._size;

    const MinorImageVersion = loadU2Field(d, ptr);
    ptr += MinorImageVersion._size;

    const MajorSubsystemVersion = loadU2Field(d, ptr);
    ptr += MajorSubsystemVersion._size;

    const MinorSubsystemVersion = loadU2Field(d, ptr);
    ptr += MinorSubsystemVersion._size;

    const Win32VersionValue = loadU4Field(d, ptr);
    ptr += Win32VersionValue._size;

    const SizeOfImage = loadU4Field(d, ptr);
    ptr += SizeOfImage._size;

    const SizeOfHeaders = loadU4Field(d, ptr);
    ptr += SizeOfHeaders._size;

    const CheckSum = loadU4Field(d, ptr);
    ptr += CheckSum._size;

    const Subsystem = loadU2EnumField<F.ImageSubsystem>(d, ptr);
    ptr += Subsystem._size;

    const DllCharacteristics = loadU2EnumField<F.ImageDllCharacteristics>(d, ptr);
    ptr += DllCharacteristics._size;

    const SizeOfStackReserve = loadU4Field(d, ptr);
    ptr += SizeOfStackReserve._size;

    const SizeOfStackCommit = loadU4Field(d, ptr);
    ptr += SizeOfStackCommit._size;

    const SizeOfHeapReserve = loadU4Field(d, ptr);
    ptr += SizeOfHeapReserve._size;

    const SizeOfHeapCommit = loadU4Field(d, ptr);
    ptr += SizeOfHeapCommit._size;

    const LoaderFlags = loadU4Field(d, ptr);
    ptr += LoaderFlags._size;

    const NumberOfRvaAndSizes = loadU4Field(d, ptr);
    ptr += NumberOfRvaAndSizes._size;

    return {
        _offset: p, _size: ptr - p,
        Magic,
        MajorLinkerVersion,
        MinorLinkerVersion,
        SizeOfCode,
        SizeOfInitializedData,
        SizeOfUninitializedData,
        AddressOfEntryPoint,
        BaseOfCode,
        BaseOfData,
        ImageBase,
        SectionAlignment,
        FileAlignment,
        MajorOperatingSystemVersion,
        MinorOperatingSystemVersion,
        MajorImageVersion,
        MinorImageVersion,
        MajorSubsystemVersion,
        MinorSubsystemVersion,
        Win32VersionValue,
        SizeOfImage,
        SizeOfHeaders,
        CheckSum,
        Subsystem,
        DllCharacteristics,
        SizeOfStackReserve,
        SizeOfStackCommit,
        SizeOfHeapReserve,
        SizeOfHeapCommit,
        LoaderFlags,
        NumberOfRvaAndSizes,
    };
}

export function loadImageOptionalHeader64(d: FileDataProvider, p: number): S.ImageOptionalHeader64 {
    let ptr = p;

    const Magic = loadU2Field(d, ptr);
    ptr += Magic._size;

    const MajorLinkerVersion = loadU1Field(d, ptr);
    ptr += MajorLinkerVersion._size;

    const MinorLinkerVersion = loadU1Field(d, ptr);
    ptr += MinorLinkerVersion._size;

    const SizeOfCode = loadU4Field(d, ptr);
    ptr += SizeOfCode._size;

    const SizeOfInitializedData = loadU4Field(d, ptr);
    ptr += SizeOfInitializedData._size;

    const SizeOfUninitializedData = loadU4Field(d, ptr);
    ptr += SizeOfUninitializedData._size;

    const AddressOfEntryPoint = loadU4Field(d, ptr);
    ptr += AddressOfEntryPoint._size;

    const BaseOfCode = loadU4Field(d, ptr);
    ptr += BaseOfCode._size;

    const ImageBase = loadU8Field(d, ptr);
    ptr += ImageBase._size;

    const SectionAlignment = loadU4Field(d, ptr);
    ptr += SectionAlignment._size;

    const FileAlignment = loadU4Field(d, ptr);
    ptr += FileAlignment._size;

    const MajorOperatingSystemVersion = loadU2Field(d, ptr);
    ptr += MajorOperatingSystemVersion._size;

    const MinorOperatingSystemVersion = loadU2Field(d, ptr);
    ptr += MinorOperatingSystemVersion._size;

    const MajorImageVersion = loadU2Field(d, ptr);
    ptr += MajorImageVersion._size;

    const MinorImageVersion = loadU2Field(d, ptr);
    ptr += MinorImageVersion._size;

    const MajorSubsystemVersion = loadU2Field(d, ptr);
    ptr += MajorSubsystemVersion._size;

    const MinorSubsystemVersion = loadU2Field(d, ptr);
    ptr += MinorSubsystemVersion._size;

    const Win32VersionValue = loadU4Field(d, ptr);
    ptr += Win32VersionValue._size;

    const SizeOfImage = loadU4Field(d, ptr);
    ptr += SizeOfImage._size;

    const SizeOfHeaders = loadU4Field(d, ptr);
    ptr += SizeOfHeaders._size;

    const CheckSum = loadU4Field(d, ptr);
    ptr += CheckSum._size;

    const Subsystem = loadU2EnumField<F.ImageSubsystem>(d, ptr);
    ptr += Subsystem._size;

    const DllCharacteristics = loadU2EnumField<F.ImageDllCharacteristics>(d, ptr);
    ptr += DllCharacteristics._size;

    const SizeOfStackReserve = loadU8Field(d, ptr);
    ptr += SizeOfStackReserve._size;

    const SizeOfStackCommit = loadU8Field(d, ptr);
    ptr += SizeOfStackCommit._size;

    const SizeOfHeapReserve = loadU8Field(d, ptr);
    ptr += SizeOfHeapReserve._size;

    const SizeOfHeapCommit = loadU8Field(d, ptr);
    ptr += SizeOfHeapCommit._size;

    const LoaderFlags = loadU4Field(d, ptr);
    ptr += LoaderFlags._size;

    const NumberOfRvaAndSizes = loadU4Field(d, ptr);
    ptr += NumberOfRvaAndSizes._size;

    return {
        _offset: p, _size: ptr - p,
        Magic,
        MajorLinkerVersion,
        MinorLinkerVersion,
        SizeOfCode,
        SizeOfInitializedData,
        SizeOfUninitializedData,
        AddressOfEntryPoint,
        BaseOfCode,
        ImageBase,
        SectionAlignment,
        FileAlignment,
        MajorOperatingSystemVersion,
        MinorOperatingSystemVersion,
        MajorImageVersion,
        MinorImageVersion,
        MajorSubsystemVersion,
        MinorSubsystemVersion,
        Win32VersionValue,
        SizeOfImage,
        SizeOfHeaders,
        CheckSum,
        Subsystem,
        DllCharacteristics,
        SizeOfStackReserve,
        SizeOfStackCommit,
        SizeOfHeapReserve,
        SizeOfHeapCommit,
        LoaderFlags,
        NumberOfRvaAndSizes,
    };
}

export function loadImageDataDirectory(d: FileDataProvider, p: number): S.ImageDataDirectory {
    let ptr = p;

    const VirtualAddress = loadU4Field(d, ptr);
    ptr += VirtualAddress._size;

    const Size = loadU4Field(d, ptr);
    ptr += Size._size;

    return {
        _offset: p, _size: ptr - p,
        VirtualAddress,
        Size,
    };
}

export function loadImageSectionHeader(d: FileDataProvider, p: number): S.ImageSectionHeader {
    let ptr = p;

    const Name = loadFixedSizeAsciiStringField(d, ptr, 8);
    ptr += Name._size;

    const VirtualSize = loadU4Field(d, ptr);
    ptr += VirtualSize._size;

    const VirtualAddress = loadU4Field(d, ptr);
    ptr += VirtualAddress._size;

    const SizeOfRawData = loadU4Field(d, ptr);
    ptr += SizeOfRawData._size;

    const PointerToRawData = loadU4Field(d, ptr);
    ptr += PointerToRawData._size;

    const PointerToRelocations = loadU4Field(d, ptr);
    ptr += PointerToRelocations._size;

    const PointerToLinenumbers = loadU4Field(d, ptr);
    ptr += PointerToLinenumbers._size;

    const NumberOfRelocations = loadU2Field(d, ptr);
    ptr += NumberOfRelocations._size;

    const NumberOfLinenumbers = loadU2Field(d, ptr);
    ptr += NumberOfLinenumbers._size;

    const Characteristics = loadU4EnumField<F.ImageSection>(d, ptr);
    ptr += Characteristics._size;

    return {
        _offset: p, _size: ptr - p,
        Name,
        VirtualSize,
        VirtualAddress,
        SizeOfRawData,
        PointerToRawData,
        PointerToRelocations,
        PointerToLinenumbers,
        NumberOfRelocations,
        NumberOfLinenumbers,
        Characteristics,
    };
}

//
// Metadata structures.
//

export function loadCliHeader(d: FileDataProvider, p: number): S.CliHeader {
    let ptr = p;

    const cb = loadU4Field(d, ptr);
    ptr += cb._size;

    const MajorRuntimeVersion = loadU2Field(d, ptr);
    ptr += MajorRuntimeVersion._size;

    const MinorRuntimeVersion = loadU2Field(d, ptr);
    ptr += MinorRuntimeVersion._size;

    const MetaData = loadImageDataDirectory(d, ptr);
    ptr += MetaData._size;

    const Flags = loadU4Field(d, ptr);
    ptr += Flags._size;

    const EntryPointToken = loadU4Field(d, ptr);
    ptr += EntryPointToken._size;

    const Resources = loadImageDataDirectory(d, ptr);
    ptr += Resources._size;

    const StrongNameSignature = loadImageDataDirectory(d, ptr);
    ptr += StrongNameSignature._size;

    const CodeManagerTable = loadImageDataDirectory(d, ptr);
    ptr += CodeManagerTable._size;

    const VTableFixups = loadImageDataDirectory(d, ptr);
    ptr += VTableFixups._size;

    const ExportAddressTableJumps = loadImageDataDirectory(d, ptr);
    ptr += ExportAddressTableJumps._size;

    const ManagedNativeHeader = loadImageDataDirectory(d, ptr);
    ptr += ManagedNativeHeader._size;

    return {
        _offset: p, _size: ptr - p,
        cb,
        MajorRuntimeVersion,
        MinorRuntimeVersion,
        MetaData,
        Flags,
        EntryPointToken,
        Resources,
        StrongNameSignature,
        CodeManagerTable,
        VTableFixups,
        ExportAddressTableJumps,
        ManagedNativeHeader,
    };
}

export function loadMetadataRoot(d: FileDataProvider, p: number): S.MetadataRoot {
    let ptr = p;

    const Signature = loadU4Field(d, ptr);
    ptr += Signature._size;

    const MajorVersion = loadU2Field(d, ptr);
    ptr += MajorVersion._size;

    const MinorVersion = loadU2Field(d, ptr);
    ptr += MinorVersion._size;

    const Reserved = loadU4Field(d, ptr);
    ptr += Reserved._size;

    const VersionLength = loadU4Field(d, ptr);
    ptr += VersionLength._size;

    const VersionString = loadNullTerminatedStringField(d, ptr);
    ptr += VersionString._size;

    const paddingSize = U.calculatePadding(VersionString._size);
    const VersionPadding = loadFixedSizeByteArrayField(d, ptr, paddingSize);
    ptr += VersionPadding._size;

    const Flags = loadU2Field(d, ptr);
    ptr += Flags._size;

    const Streams = loadU2Field(d, ptr);
    ptr += Streams._size;

    return {
        _offset: p, _size: ptr - p,
        Signature,
        MajorVersion,
        MinorVersion,
        Reserved,
        VersionLength,
        VersionString,
        VersionPadding,
        Flags,
        Streams,
    };
}

export function loadMetadataStreamHeader(d: FileDataProvider, p: number): S.MetadataStreamHeader {
    let ptr = p;

    const Offset = loadU4Field(d, ptr);
    ptr += Offset._size;

    const Size = loadU4Field(d, ptr);
    ptr += Size._size;

    const Name = loadNullTerminatedStringField(d, ptr);
    ptr += Name._size;

    const paddingSize = U.calculatePadding(Name._size);
    const Padding = loadFixedSizeByteArrayField(d, ptr, paddingSize);
    ptr += Padding._size;

    return {
        _offset: p, _size: ptr - p,
        Offset,
        Size,
        Name,
        Padding,
    };
}

export function loadMetadataTableHeader(d: FileDataProvider, p: number): S.MetadataTableHeader {
    let ptr = p;

    const Reserved = loadU4Field(d, ptr);
    ptr += Reserved._size;

    const MajorVersion = loadU1Field(d, ptr);
    ptr += MajorVersion._size;

    const MinorVersion = loadU1Field(d, ptr);
    ptr += MinorVersion._size;

    const HeapSizes = loadU1Field(d, ptr);
    ptr += HeapSizes._size;

    const Reserved2 = loadU1Field(d, ptr);
    ptr += Reserved2._size;

    const Valid = loadU8Field(d, ptr);
    ptr += Valid._size;

    const Sorted = loadU8Field(d, ptr);
    ptr += Sorted._size;

    const tables = U.count1(Valid.high) + U.count1(Valid.low);
    const Rows = loadStructArrayByCount(d, ptr, loadU4Field, tables);
    ptr += Rows._size;

    return {
        _offset: p, _size: ptr - p,
        Reserved,
        MajorVersion,
        MinorVersion,
        HeapSizes,
        Reserved2,
        Valid,
        Sorted,
        Rows,
    };
}

export function loadMetadataUSItem(d: FileDataProvider, p: number): S.MetadataUSItem {
    let ptr = p;

    const Size = loadCompressedUIntField(d, ptr);
    ptr += Size._size;

    const sz = Size.value;
    const strSize = sz > 0 ? sz - 1 : 0;
    const suffixSize = sz > 0 ? 1 : 0;

    const Value = loadFixedSizeUnicodeStringField(d, ptr, strSize);
    ptr += Value._size;

    const Suffix = loadFixedSizeByteArrayField(d, ptr, suffixSize);
    ptr += Suffix._size;

    return {
        _offset: p, _size: ptr - p,
        Size,
        Value,
        Suffix,
    };
}

export function loadMetadataBlobItem(d: FileDataProvider, p: number): S.MetadataBlobItem {
    let ptr = p;

    const Size = loadCompressedUIntField(d, ptr);
    ptr += Size._size;

    const Value = loadFixedSizeByteArrayField(d, ptr, Size.value);
    ptr += Value._size;

    return {
        _offset: p, _size: ptr - p,
        Size,
        Value,
    };
}

export function loadMdsStringsField(
    d: FileDataProvider & MetadataSizingProvider,
    p: number): S.MdsStringsField {

    return d.getHeapSize(F.MetadataHeapSizeID.String) == 4
        ? loadU4Field(d, p) : loadU2Field(d, p);
}

export function loadMdsGuidField(
    d: FileDataProvider & MetadataSizingProvider,
    p: number): S.MdsGuidField {

    return d.getHeapSize(F.MetadataHeapSizeID.GUID) == 4
        ? loadU4Field(d, p) : loadU2Field(d, p);
}

export function loadMdsBlobField(
    d: FileDataProvider & MetadataSizingProvider,
    p: number): S.MdsBlobField {

    return d.getHeapSize(F.MetadataHeapSizeID.Blob) == 4
        ? loadU4Field(d, p) : loadU2Field(d, p);
}

export function loadMdtRidField(
    d: FileDataProvider & MetadataSizingProvider,
    t: F.MetadataTableIndex, p: number): S.MdtRidField {

    return d.getTableIDSize(t) == 4
        ? loadU4Field(d, p) : loadU2Field(d, p);
}

export function loadMdCodedTokenField(
    d: FileDataProvider & MetadataSizingProvider,
    t: F.MetadataCodedTokenIndex, p: number): S.MdCodedTokenField {

    const baseField = d.getCodedTokenSize(t) == 4
        ? loadU4Field(d, p) : loadU2Field(d, p);
    const codedTokenInfo = decodeCodedToken(baseField.value, t);

    return {
        ...baseField, ...codedTokenInfo
    };
}

export function loadMdTokenField(d: FileDataProvider, p: number): S.MdTokenField {
    const baseField = loadU4Field(d, p);
    const tid: F.MetadataTableIndex = (baseField.value & 0xFF000000) >> 24;
    const rid = baseField.value & 0x00FFFFFF;
    return {
        ...baseField, tid, rid
    };
}

export function decodeCodedToken(token: number, t: F.MetadataCodedTokenIndex): { tid: F.MetadataTableIndex, rid: number } {
    const cti = F.ctc[t];
    const tid = cti.tables[token & ((1 << cti.tagSize) - 1)];
    const rid = token >> cti.tagSize;
    return { tid, rid };
}

//
// Metadata tables.
//

export function loadMdtModule(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtModuleItem {
    let ptr = p;

    const Generation = loadU2Field(d, ptr);
    ptr += Generation._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Mvid = loadMdsGuidField(d, ptr);
    ptr += Mvid._size;

    const EncId = loadMdsGuidField(d, ptr);
    ptr += EncId._size;

    const EncBaseId = loadMdsGuidField(d, ptr);
    ptr += EncBaseId._size;

    return {
        _offset: p, _size: ptr - p,
        Generation,
        Name,
        Mvid,
        EncId,
        EncBaseId,
    };
}

export function loadMdtTypeRef(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtTypeRefItem {
    let ptr = p;

    const ResolutionScope = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.ResolutionScope, ptr);
    ptr += ResolutionScope._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Namespace = loadMdsStringsField(d, ptr);
    ptr += Namespace._size;

    return {
        _offset: p, _size: ptr - p,
        ResolutionScope,
        Name,
        Namespace,
    };
}

export function loadMdtTypeDef(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtTypeDefItem {
    let ptr = p;

    const Flags = loadU4EnumField<F.CorTypeAttr>(d, ptr);
    ptr += Flags._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Namespace = loadMdsStringsField(d, ptr);
    ptr += Namespace._size;

    const Extends = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.TypeDefOrRef, ptr);
    ptr += Extends._size;

    const FieldList = loadMdtRidField(d, F.MetadataTableIndex.Field, ptr);
    ptr += FieldList._size;

    const MethodList = loadMdtRidField(d, F.MetadataTableIndex.MethodDef, ptr);
    ptr += MethodList._size;

    return {
        _offset: p, _size: ptr - p,
        Flags,
        Name,
        Namespace,
        Extends,
        FieldList,
        MethodList,
    };
}

export function loadMdtFieldPtr(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtFieldPtrItem {
    let ptr = p;

    const Field = loadMdtRidField(d, F.MetadataTableIndex.Field, ptr);
    ptr += Field._size;

    return {
        _offset: p, _size: ptr - p,
        Field,
    };
}

export function loadMdtField(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtFieldItem {
    let ptr = p;

    const Flags = loadU2EnumField<F.CorFieldAttr>(d, ptr);
    ptr += Flags._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Signature = loadMdsBlobField(d, ptr);
    ptr += Signature._size;

    return {
        _offset: p, _size: ptr - p,
        Flags,
        Name,
        Signature,
    };
}

export function loadMdtMethodPtr(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtMethodPtrItem {
    let ptr = p;

    const Method = loadMdtRidField(d, F.MetadataTableIndex.MethodDef, ptr);
    ptr += Method._size;

    return {
        _offset: p, _size: ptr - p,
        Method,
    };
}

export function loadMdtMethodDef(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtMethodDefItem {
    let ptr = p;

    const RVA = loadU4Field(d, ptr);
    ptr += RVA._size;

    const ImplFlags = loadU2EnumField<F.CorMethodImpl>(d, ptr);
    ptr += ImplFlags._size;

    const Flags = loadU2EnumField<F.CorMethodAttr>(d, ptr);
    ptr += Flags._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Signature = loadMdsBlobField(d, ptr);
    ptr += Signature._size;

    const ParamList = loadMdtRidField(d, F.MetadataTableIndex.Param, ptr);
    ptr += ParamList._size;

    return {
        _offset: p, _size: ptr - p,
        RVA,
        ImplFlags,
        Flags,
        Name,
        Signature,
        ParamList,
    };
}

export function loadMdtParamPtr(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtParamPtrItem {
    let ptr = p;

    const Param = loadMdtRidField(d, F.MetadataTableIndex.Param, ptr);
    ptr += Param._size;

    return {
        _offset: p, _size: ptr - p,
        Param,
    };
}

export function loadMdtParam(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtParamItem {
    let ptr = p;

    const Flags = loadU2EnumField<F.CorParamAttr>(d, ptr);
    ptr += Flags._size;

    const Sequence = loadU2Field(d, ptr);
    ptr += Sequence._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    return {
        _offset: p, _size: ptr - p,
        Flags,
        Sequence,
        Name,
    };
}

export function loadMdtInterfaceImpl(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtInterfaceImplItem {
    let ptr = p;

    const Class = loadMdtRidField(d, F.MetadataTableIndex.TypeDef, ptr);
    ptr += Class._size;

    const Interface = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.TypeDefOrRef, ptr);
    ptr += Interface._size;

    return {
        _offset: p, _size: ptr - p,
        Class,
        Interface,
    };
}

export function loadMdtMemberRef(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtMemberRefItem {
    let ptr = p;

    const Class = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.MemberRefParent, ptr);
    ptr += Class._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Signature = loadMdsBlobField(d, ptr);
    ptr += Signature._size;

    return {
        _offset: p, _size: ptr - p,
        Class,
        Name,
        Signature,
    };
}

export function loadMdtConstant(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtConstantItem {
    let ptr = p;

    const Type = loadU1EnumField<F.CorElementType>(d, ptr);
    ptr += Type._size;

    const PaddingZero = loadU1Field(d, ptr);
    ptr += PaddingZero._size;

    const Parent = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.HasConstant, ptr);
    ptr += Parent._size;

    const Value = loadMdsBlobField(d, ptr);
    ptr += Value._size;

    return {
        _offset: p, _size: ptr - p,
        Type,
        PaddingZero,
        Parent,
        Value,
    };
}

export function loadMdtCustomAttribute(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtCustomAttributeItem {
    let ptr = p;

    const Parent = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.HasCustomAttribute, ptr);
    ptr += Parent._size;

    const Type = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.CustomAttributeType, ptr);
    ptr += Type._size;

    const Value = loadMdsBlobField(d, ptr);
    ptr += Value._size;

    return {
        _offset: p, _size: ptr - p,
        Parent,
        Type,
        Value,
    };
}

export function loadMdtFieldMarshal(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtFieldMarshalItem {
    let ptr = p;

    const Parent = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.HasFieldMarshall, ptr);
    ptr += Parent._size;

    const NativeType = loadMdsBlobField(d, ptr);
    ptr += NativeType._size;

    return {
        _offset: p, _size: ptr - p,
        Parent,
        NativeType,
    };
}

export function loadMdtDeclSecurity(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtDeclSecurityItem {
    let ptr = p;

    const Action = loadU2EnumField<F.CorDeclSecurity>(d, ptr);
    ptr += Action._size;

    const Parent = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.HasDeclSecurity, ptr);
    ptr += Parent._size;

    const PermissionSet = loadMdsBlobField(d, ptr);
    ptr += PermissionSet._size;

    return {
        _offset: p, _size: ptr - p,
        Action,
        Parent,
        PermissionSet,
    };
}

export function loadMdtClassLayout(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtClassLayoutItem {
    let ptr = p;

    const PackingSize = loadU2Field(d, ptr);
    ptr += PackingSize._size;

    const ClassSize = loadU4Field(d, ptr);
    ptr += ClassSize._size;

    const Parent = loadMdtRidField(d, F.MetadataTableIndex.TypeDef, ptr);
    ptr += Parent._size;

    return {
        _offset: p, _size: ptr - p,
        PackingSize,
        ClassSize,
        Parent,
    };
}

export function loadMdtFieldLayout(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtFieldLayoutItem {
    let ptr = p;

    const OffSet = loadU4Field(d, ptr);
    ptr += OffSet._size;

    const Field = loadMdtRidField(d, F.MetadataTableIndex.Field, ptr);
    ptr += Field._size;

    return {
        _offset: p, _size: ptr - p,
        OffSet,
        Field,
    };
}

export function loadMdtStandAloneSig(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtStandAloneSigItem {
    let ptr = p;

    const Signature = loadMdsBlobField(d, ptr);
    ptr += Signature._size;

    return {
        _offset: p, _size: ptr - p,
        Signature,
    };
}

export function loadMdtEventMap(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtEventMapItem {
    let ptr = p;

    const Parent = loadMdtRidField(d, F.MetadataTableIndex.TypeDef, ptr);
    ptr += Parent._size;

    const EventList = loadMdtRidField(d, F.MetadataTableIndex.Event, ptr);
    ptr += EventList._size;

    return {
        _offset: p, _size: ptr - p,
        Parent,
        EventList,
    };
}

export function loadMdtEventPtr(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtEventPtrItem {
    let ptr = p;

    const Event = loadMdtRidField(d, F.MetadataTableIndex.Event, ptr);
    ptr += Event._size;

    return {
        _offset: p, _size: ptr - p,
        Event,
    };
}

export function loadMdtEvent(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtEventItem {
    let ptr = p;

    const EventFlags = loadU2EnumField<F.CorEventAttr>(d, ptr);
    ptr += EventFlags._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const EventType = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.TypeDefOrRef, ptr);
    ptr += EventType._size;

    return {
        _offset: p, _size: ptr - p,
        EventFlags,
        Name,
        EventType,
    };
}

export function loadMdtPropertyMap(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtPropertyMapItem {
    let ptr = p;

    const Parent = loadMdtRidField(d, F.MetadataTableIndex.TypeDef, ptr);
    ptr += Parent._size;

    const PropertyList = loadMdtRidField(d, F.MetadataTableIndex.Property, ptr);
    ptr += PropertyList._size;

    return {
        _offset: p, _size: ptr - p,
        Parent,
        PropertyList,
    };
}

export function loadMdtPropertyPtr(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtPropertyPtrItem {
    let ptr = p;

    const Property = loadMdtRidField(d, F.MetadataTableIndex.Property, ptr);
    ptr += Property._size;

    return {
        _offset: p, _size: ptr - p,
        Property,
    };
}

export function loadMdtProperty(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtPropertyItem {
    let ptr = p;

    const PropFlags = loadU2EnumField<F.CorPropertyAttr>(d, ptr);
    ptr += PropFlags._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Type = loadMdsBlobField(d, ptr);
    ptr += Type._size;

    return {
        _offset: p, _size: ptr - p,
        PropFlags,
        Name,
        Type,
    };
}

export function loadMdtMethodSemantics(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtMethodSemanticsItem {
    let ptr = p;

    const Semantic = loadU2EnumField<F.CorMethodSemanticsAttr>(d, ptr);
    ptr += Semantic._size;

    const Method = loadMdtRidField(d, F.MetadataTableIndex.MethodDef, ptr);
    ptr += Method._size;

    const Association = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.HasSemantics, ptr);
    ptr += Association._size;

    return {
        _offset: p, _size: ptr - p,
        Semantic,
        Method,
        Association,
    };
}

export function loadMdtMethodImpl(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtMethodImplItem {
    let ptr = p;

    const Class = loadMdtRidField(d, F.MetadataTableIndex.TypeDef, ptr);
    ptr += Class._size;

    const MethodBody = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.MethodDefOrRef, ptr);
    ptr += MethodBody._size;

    const MethodDeclaration = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.MethodDefOrRef, ptr);
    ptr += MethodDeclaration._size;

    return {
        _offset: p, _size: ptr - p,
        Class,
        MethodBody,
        MethodDeclaration,
    };
}

export function loadMdtModuleRef(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtModuleRefItem {
    let ptr = p;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    return {
        _offset: p, _size: ptr - p,
        Name,
    };
}

export function loadMdtTypeSpec(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtTypeSpecItem {
    let ptr = p;

    const Signature = loadMdsBlobField(d, ptr);
    ptr += Signature._size;

    return {
        _offset: p, _size: ptr - p,
        Signature,
    };
}

export function loadMdtImplMap(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtImplMapItem {
    let ptr = p;

    const MappingFlags = loadU2EnumField<F.CorPinvokeMap>(d, ptr);
    ptr += MappingFlags._size;

    const MemberForwarded = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.MemberForwarded, ptr);
    ptr += MemberForwarded._size;

    const ImportName = loadMdsStringsField(d, ptr);
    ptr += ImportName._size;

    const ImportScope = loadMdtRidField(d, F.MetadataTableIndex.ModuleRef, ptr);
    ptr += ImportScope._size;

    return {
        _offset: p, _size: ptr - p,
        MappingFlags,
        MemberForwarded,
        ImportName,
        ImportScope,
    };
}

export function loadMdtFieldRVA(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtFieldRVAItem {
    let ptr = p;

    const RVA = loadU4Field(d, ptr);
    ptr += RVA._size;

    const Field = loadMdtRidField(d, F.MetadataTableIndex.Field, ptr);
    ptr += Field._size;

    return {
        _offset: p, _size: ptr - p,
        RVA,
        Field,
    };
}

export function loadMdtENCLog(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtENCLogItem {
    let ptr = p;

    const Token = loadU4Field(d, ptr);
    ptr += Token._size;

    const FuncCode = loadU4Field(d, ptr);
    ptr += FuncCode._size;

    return {
        _offset: p, _size: ptr - p,
        Token,
        FuncCode,
    };
}

export function loadMdtENCMap(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtENCMapItem {
    let ptr = p;

    const Token = loadU4Field(d, ptr);
    ptr += Token._size;

    return {
        _offset: p, _size: ptr - p,
        Token,
    };
}

export function loadMdtAssembly(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtAssemblyItem {
    let ptr = p;

    const HashAlgId = loadU4EnumField<F.AssemblyHashAlgorithm>(d, ptr);
    ptr += HashAlgId._size;

    const MajorVersion = loadU2Field(d, ptr);
    ptr += MajorVersion._size;

    const MinorVersion = loadU2Field(d, ptr);
    ptr += MinorVersion._size;

    const BuildNumber = loadU2Field(d, ptr);
    ptr += BuildNumber._size;

    const RevisionNumber = loadU2Field(d, ptr);
    ptr += RevisionNumber._size;

    const Flags = loadU4EnumField<F.CorAssemblyFlags>(d, ptr);
    ptr += Flags._size;

    const PublicKey = loadMdsBlobField(d, ptr);
    ptr += PublicKey._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Locale = loadMdsStringsField(d, ptr);
    ptr += Locale._size;

    return {
        _offset: p, _size: ptr - p,
        HashAlgId,
        MajorVersion,
        MinorVersion,
        BuildNumber,
        RevisionNumber,
        Flags,
        PublicKey,
        Name,
        Locale,
    };
}

export function loadMdtAssemblyProcessor(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtAssemblyProcessorItem {
    let ptr = p;

    const Processor = loadU4Field(d, ptr);
    ptr += Processor._size;

    return {
        _offset: p, _size: ptr - p,
        Processor,
    };
}

export function loadMdtAssemblyOS(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtAssemblyOSItem {
    let ptr = p;

    const OSPlatformID = loadU4Field(d, ptr);
    ptr += OSPlatformID._size;

    const OSMajorVersion = loadU4Field(d, ptr);
    ptr += OSMajorVersion._size;

    const OSMinorVersion = loadU4Field(d, ptr);
    ptr += OSMinorVersion._size;

    return {
        _offset: p, _size: ptr - p,
        OSPlatformID,
        OSMajorVersion,
        OSMinorVersion,
    };
}

export function loadMdtAssemblyRef(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtAssemblyRefItem {
    let ptr = p;

    const MajorVersion = loadU2Field(d, ptr);
    ptr += MajorVersion._size;

    const MinorVersion = loadU2Field(d, ptr);
    ptr += MinorVersion._size;

    const BuildNumber = loadU2Field(d, ptr);
    ptr += BuildNumber._size;

    const RevisionNumber = loadU2Field(d, ptr);
    ptr += RevisionNumber._size;

    const Flags = loadU4EnumField<F.CorAssemblyFlags>(d, ptr);
    ptr += Flags._size;

    const PublicKeyOrToken = loadMdsBlobField(d, ptr);
    ptr += PublicKeyOrToken._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Locale = loadMdsStringsField(d, ptr);
    ptr += Locale._size;

    const HashValue = loadMdsBlobField(d, ptr);
    ptr += HashValue._size;

    return {
        _offset: p, _size: ptr - p,
        MajorVersion,
        MinorVersion,
        BuildNumber,
        RevisionNumber,
        Flags,
        PublicKeyOrToken,
        Name,
        Locale,
        HashValue,
    };
}

export function loadMdtAssemblyRefProcessor(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtAssemblyRefProcessorItem {
    let ptr = p;

    const Processor = loadU4Field(d, ptr);
    ptr += Processor._size;

    const AssemblyRef = loadMdtRidField(d, F.MetadataTableIndex.AssemblyRef, ptr);
    ptr += AssemblyRef._size;

    return {
        _offset: p, _size: ptr - p,
        Processor,
        AssemblyRef,
    };
}

export function loadMdtAssemblyRefOS(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtAssemblyRefOSItem {
    let ptr = p;

    const OSPlatformID = loadU4Field(d, ptr);
    ptr += OSPlatformID._size;

    const OSMajorVersion = loadU4Field(d, ptr);
    ptr += OSMajorVersion._size;

    const OSMinorVersion = loadU4Field(d, ptr);
    ptr += OSMinorVersion._size;

    const AssemblyRef = loadMdtRidField(d, F.MetadataTableIndex.AssemblyRef, ptr);
    ptr += AssemblyRef._size;

    return {
        _offset: p, _size: ptr - p,
        OSPlatformID,
        OSMajorVersion,
        OSMinorVersion,
        AssemblyRef,
    };
}

export function loadMdtFile(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtFileItem {
    let ptr = p;

    const Flags = loadU4EnumField<F.CorFileFlags>(d, ptr);
    ptr += Flags._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const HashValue = loadMdsBlobField(d, ptr);
    ptr += HashValue._size;

    return {
        _offset: p, _size: ptr - p,
        Flags,
        Name,
        HashValue,
    };
}

export function loadMdtExportedType(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtExportedTypeItem {
    let ptr = p;

    const Flags = loadU4EnumField<F.CorTypeAttr>(d, ptr);
    ptr += Flags._size;

    const TypeDefId = loadU4Field(d, ptr);
    ptr += TypeDefId._size;

    const TypeName = loadMdsStringsField(d, ptr);
    ptr += TypeName._size;

    const TypeNamespace = loadMdsStringsField(d, ptr);
    ptr += TypeNamespace._size;

    const Implementation = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.Implementation, ptr);
    ptr += Implementation._size;

    return {
        _offset: p, _size: ptr - p,
        Flags,
        TypeDefId,
        TypeName,
        TypeNamespace,
        Implementation,
    };
}

export function loadMdtManifestResource(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtManifestResourceItem {
    let ptr = p;

    const Offset = loadU4Field(d, ptr);
    ptr += Offset._size;

    const Flags = loadU4EnumField<F.CorManifestResourceFlags>(d, ptr);
    ptr += Flags._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    const Implementation = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.Implementation, ptr);
    ptr += Implementation._size;

    return {
        _offset: p, _size: ptr - p,
        Offset,
        Flags,
        Name,
        Implementation,
    };
}

export function loadMdtNestedClass(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtNestedClassItem {
    let ptr = p;

    const NestedClass = loadMdtRidField(d, F.MetadataTableIndex.TypeDef, ptr);
    ptr += NestedClass._size;

    const EnclosingClass = loadMdtRidField(d, F.MetadataTableIndex.TypeDef, ptr);
    ptr += EnclosingClass._size;

    return {
        _offset: p, _size: ptr - p,
        NestedClass,
        EnclosingClass,
    };
}

export function loadMdtGenericParam(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtGenericParamItem {
    let ptr = p;

    const Number = loadU2Field(d, ptr);
    ptr += Number._size;

    const Flags = loadU2EnumField<F.CorGenericParamAttr>(d, ptr);
    ptr += Flags._size;

    const Owner = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.TypeOrMethodDef, ptr);
    ptr += Owner._size;

    const Name = loadMdsStringsField(d, ptr);
    ptr += Name._size;

    return {
        _offset: p, _size: ptr - p,
        Number,
        Flags,
        Owner,
        Name,
    };
}

export function loadMdtMethodSpec(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtMethodSpecItem {
    let ptr = p;

    const Method = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.MethodDefOrRef, ptr);
    ptr += Method._size;

    const Instantiation = loadMdsBlobField(d, ptr);
    ptr += Instantiation._size;

    return {
        _offset: p, _size: ptr - p,
        Method,
        Instantiation,
    };
}

export function loadMdtGenericParamConstraint(d: FileDataProvider & MetadataSizingProvider, p: number): S.MdtGenericParamConstraintItem {
    let ptr = p;

    const Owner = loadMdtRidField(d, F.MetadataTableIndex.GenericParam, ptr);
    ptr += Owner._size;

    const Constraint = loadMdCodedTokenField(d, F.MetadataCodedTokenIndex.TypeDefOrRef, ptr);
    ptr += Constraint._size;

    return {
        _offset: p, _size: ptr - p,
        Owner,
        Constraint,
    };
}
