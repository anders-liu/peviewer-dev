import * as S from "./structures";
import * as FL from "./image-flags";

export interface FileDataProvider {
    getU1(p: number): number;
    getU2(p: number): number;
    getU4(p: number): number;
    getData(p: number, sz: number): Uint8Array;
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

export function loadU1EnumField<TEnum>(d: FileDataProvider, p: number): S.U1EnumField<TEnum> {
    return {
        _offset: p, _size: 1, data: d.getData(p, 1), value: d.getU1(p) as any as TEnum
    };
}

export function loadU2EnumField<TEnum>(d: FileDataProvider, p: number): S.U2EnumField<TEnum> {
    return {
        _offset: p, _size: 2, data: d.getData(p, 2), value: d.getU2(p) as any as TEnum
    };
}

export function loadU4EnumField<TEnum>(d: FileDataProvider, p: number): S.U4EnumField<TEnum> {
    return {
        _offset: p, _size: 4, data: d.getData(p, 4), value: d.getU4(p) as any as TEnum
    };
}

export function loadFixedSizeByteArray(d: FileDataProvider, p: number, sz: number): S.Field {
    return {
        _offset: p, _size: sz, data: d.getData(p, sz)
    };
}

export function loadFixedSizeAsciiStringField(d: FileDataProvider, p: number, sz: number): S.StringField {
    const data = d.getData(p, sz);
    const value = String.fromCharCode.apply(null, Array.from(data));

    return {
        _offset: p, _size: sz, data, value
    };
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

    const e_res = loadFixedSizeByteArray(d, ptr, 4 * 2);
    ptr += e_res._size;

    const e_oemid = loadU2Field(d, ptr);
    ptr += e_oemid._size;

    const e_oeminfo = loadU2Field(d, ptr);
    ptr += e_oeminfo._size;

    const e_res2 = loadFixedSizeByteArray(d, ptr, 10 * 2);
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

    const Machine = loadU2Field(d, p);
    ptr += Machine._size;

    const NumberOfSections = loadU2Field(d, p);
    ptr += NumberOfSections._size;

    const TimeDateStamp = loadU4Field(d, p);
    ptr += TimeDateStamp._size;

    const PointerToSymbolTable = loadU4Field(d, p);
    ptr += PointerToSymbolTable._size;

    const NumberOfSymbols = loadU4Field(d, p);
    ptr += NumberOfSymbols._size;

    const SizeOfOptionalHeader = loadU2Field(d, p);
    ptr += SizeOfOptionalHeader._size;

    const Characteristics = loadU2EnumField<FL.ImageFile>(d, p);
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

    const Magic = loadU2Field(d, p);
    ptr += Magic._size;

    const MajorLinkerVersion = loadU1Field(d, p);
    ptr += MajorLinkerVersion._size;

    const MinorLinkerVersion = loadU1Field(d, p);
    ptr += MinorLinkerVersion._size;

    const SizeOfCode = loadU4Field(d, p);
    ptr += SizeOfCode._size;

    const SizeOfInitializedData = loadU4Field(d, p);
    ptr += SizeOfInitializedData._size;

    const SizeOfUninitializedData = loadU4Field(d, p);
    ptr += SizeOfUninitializedData._size;

    const AddressOfEntryPoint = loadU4Field(d, p);
    ptr += AddressOfEntryPoint._size;

    const BaseOfCode = loadU4Field(d, p);
    ptr += BaseOfCode._size;

    const BaseOfData = loadU4Field(d, p);
    ptr += BaseOfData._size;

    const ImageBase = loadU4Field(d, p);
    ptr += ImageBase._size;

    const SectionAlignment = loadU4Field(d, p);
    ptr += SectionAlignment._size;

    const FileAlignment = loadU4Field(d, p);
    ptr += FileAlignment._size;

    const MajorOperatingSystemVersion = loadU2Field(d, p);
    ptr += MajorOperatingSystemVersion._size;

    const MinorOperatingSystemVersion = loadU2Field(d, p);
    ptr += MinorOperatingSystemVersion._size;

    const MajorImageVersion = loadU2Field(d, p);
    ptr += MajorImageVersion._size;

    const MinorImageVersion = loadU2Field(d, p);
    ptr += MinorImageVersion._size;

    const MajorSubsystemVersion = loadU2Field(d, p);
    ptr += MajorSubsystemVersion._size;

    const MinorSubsystemVersion = loadU2Field(d, p);
    ptr += MinorSubsystemVersion._size;

    const Win32VersionValue = loadU4Field(d, p);
    ptr += Win32VersionValue._size;

    const SizeOfImage = loadU4Field(d, p);
    ptr += SizeOfImage._size;

    const SizeOfHeaders = loadU4Field(d, p);
    ptr += SizeOfHeaders._size;

    const CheckSum = loadU4Field(d, p);
    ptr += CheckSum._size;

    const Subsystem = loadU2EnumField<FL.ImageSubsystem>(d, p);
    ptr += Subsystem._size;

    const DllCharacteristics = loadU2EnumField<FL.ImageDllCharacteristics>(d, p);
    ptr += DllCharacteristics._size;

    const SizeOfStackReserve = loadU4Field(d, p);
    ptr += SizeOfStackReserve._size;

    const SizeOfStackCommit = loadU4Field(d, p);
    ptr += SizeOfStackCommit._size;

    const SizeOfHeapReserve = loadU4Field(d, p);
    ptr += SizeOfHeapReserve._size;

    const SizeOfHeapCommit = loadU4Field(d, p);
    ptr += SizeOfHeapCommit._size;

    const LoaderFlags = loadU4Field(d, p);
    ptr += LoaderFlags._size;

    const NumberOfRvaAndSizes = loadU4Field(d, p);
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

    const Magic = loadU2Field(d, p);
    ptr += Magic._size;

    const MajorLinkerVersion = loadU1Field(d, p);
    ptr += MajorLinkerVersion._size;

    const MinorLinkerVersion = loadU1Field(d, p);
    ptr += MinorLinkerVersion._size;

    const SizeOfCode = loadU4Field(d, p);
    ptr += SizeOfCode._size;

    const SizeOfInitializedData = loadU4Field(d, p);
    ptr += SizeOfInitializedData._size;

    const SizeOfUninitializedData = loadU4Field(d, p);
    ptr += SizeOfUninitializedData._size;

    const AddressOfEntryPoint = loadU4Field(d, p);
    ptr += AddressOfEntryPoint._size;

    const BaseOfCode = loadU4Field(d, p);
    ptr += BaseOfCode._size;

    const ImageBase = loadU8Field(d, p);
    ptr += ImageBase._size;

    const SectionAlignment = loadU4Field(d, p);
    ptr += SectionAlignment._size;

    const FileAlignment = loadU4Field(d, p);
    ptr += FileAlignment._size;

    const MajorOperatingSystemVersion = loadU2Field(d, p);
    ptr += MajorOperatingSystemVersion._size;

    const MinorOperatingSystemVersion = loadU2Field(d, p);
    ptr += MinorOperatingSystemVersion._size;

    const MajorImageVersion = loadU2Field(d, p);
    ptr += MajorImageVersion._size;

    const MinorImageVersion = loadU2Field(d, p);
    ptr += MinorImageVersion._size;

    const MajorSubsystemVersion = loadU2Field(d, p);
    ptr += MajorSubsystemVersion._size;

    const MinorSubsystemVersion = loadU2Field(d, p);
    ptr += MinorSubsystemVersion._size;

    const Win32VersionValue = loadU4Field(d, p);
    ptr += Win32VersionValue._size;

    const SizeOfImage = loadU4Field(d, p);
    ptr += SizeOfImage._size;

    const SizeOfHeaders = loadU4Field(d, p);
    ptr += SizeOfHeaders._size;

    const CheckSum = loadU4Field(d, p);
    ptr += CheckSum._size;

    const Subsystem = loadU2EnumField<FL.ImageSubsystem>(d, p);
    ptr += Subsystem._size;

    const DllCharacteristics = loadU2EnumField<FL.ImageDllCharacteristics>(d, p);
    ptr += DllCharacteristics._size;

    const SizeOfStackReserve = loadU8Field(d, p);
    ptr += SizeOfStackReserve._size;

    const SizeOfStackCommit = loadU8Field(d, p);
    ptr += SizeOfStackCommit._size;

    const SizeOfHeapReserve = loadU8Field(d, p);
    ptr += SizeOfHeapReserve._size;

    const SizeOfHeapCommit = loadU8Field(d, p);
    ptr += SizeOfHeapCommit._size;

    const LoaderFlags = loadU4Field(d, p);
    ptr += LoaderFlags._size;

    const NumberOfRvaAndSizes = loadU4Field(d, p);
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

export function loadImageSectionHeader(d: FileDataProvider, p: number): S.ImageSectionHeader {
    let ptr = p;

    const Name = loadFixedSizeAsciiStringField(d, p, 8);
    ptr += Name._size;

    const VirtualSize = loadU4Field(d, p);
    ptr += VirtualSize._size;

    const VirtualAddress = loadU4Field(d, p);
    ptr += VirtualAddress._size;

    const SizeOfRawData = loadU4Field(d, p);
    ptr += SizeOfRawData._size;

    const PointerToRawData = loadU4Field(d, p);
    ptr += PointerToRawData._size;

    const PointerToRelocations = loadU4Field(d, p);
    ptr += PointerToRelocations._size;

    const PointerToLinenumbers = loadU4Field(d, p);
    ptr += PointerToLinenumbers._size;

    const NumberOfRelocations = loadU2Field(d, p);
    ptr += NumberOfRelocations._size;

    const NumberOfLinenumbers = loadU2Field(d, p);
    ptr += NumberOfLinenumbers._size;

    const Characteristics = loadU4EnumField<FL.ImageSection>(d, p);
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