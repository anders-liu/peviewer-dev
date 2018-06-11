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
