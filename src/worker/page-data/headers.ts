import { PEImage } from "../pe/image";
import * as S from "../pe/structures";
import * as F from "../pe/image-flags";
import * as FM from "./formatter";
import { Z_UNKNOWN } from "zlib";

export function generateHeadersPageData(pe: PEImage): W.HeadersPageData {
    return {
        nav: {
            pageID: W.PageID.HEADERS,
            title: W.KnownTitle.HEADERS,
        },
        dosHeader: generateDosHeader(pe),
        peSignature: generatePESignature(pe),
        fileHeader: generateFileHeader(pe),
        optionalHeader: generateOptionalHeader(pe),
        dataDirectories: generateDataDirectories(pe),
        sectionHeaders: generateSectionHeaders(pe),
    };
}

function generateDosHeader(pe: PEImage): W.SimpleStruct {
    let s: W.SimpleStruct = {
        title: W.KnownTitle.DOS_HEADER,
        elemID: W.KnownElemID.DOS_HEADER,
    };

    const h = pe.getDosHeader();
    if (!h) return s;

    s.items = [
        FM.formatU2Field("e_magic", h.e_magic),
        FM.formatU2Field("e_cblp", h.e_cblp),
        FM.formatU2Field("e_cp", h.e_cp),
        FM.formatU2Field("e_crlc", h.e_crlc),
        FM.formatU2Field("e_cparhdr", h.e_cparhdr),
        FM.formatU2Field("e_minalloc", h.e_minalloc),
        FM.formatU2Field("e_maxalloc", h.e_maxalloc),
        FM.formatU2Field("e_ss", h.e_ss),
        FM.formatU2Field("e_sp", h.e_sp),
        FM.formatU2Field("e_csum", h.e_csum),
        FM.formatU2Field("e_ip", h.e_ip),
        FM.formatU2Field("e_cs", h.e_cs),
        FM.formatU2Field("e_lfarlc", h.e_lfarlc),
        FM.formatU2Field("e_ovno", h.e_ovno),
        FM.formatBytesField("e_res", h.e_res),
        FM.formatU2Field("e_oemid", h.e_oemid),
        FM.formatU2Field("e_oeminfo", h.e_oeminfo),
        FM.formatBytesField("e_res2", h.e_res2),
        FM.formatU4Field("e_lfanew", h.e_lfanew),
    ];

    return s;
}

function generatePESignature(pe: PEImage): W.SimpleStruct {
    let s: W.SimpleStruct = {
        title: W.KnownTitle.PE_SIGNATURE,
        elemID: W.KnownElemID.PE_SIGNATURE,
    };

    const h = pe.getPESignature();
    if (!h) return s;

    s.items = [
        FM.formatU4Field("PE Signature", h),
    ];

    return s;
}

function generateFileHeader(pe: PEImage): W.SimpleStruct {
    let s: W.SimpleStruct = {
        title: W.KnownTitle.FILE_HEADER,
        elemID: W.KnownElemID.FILE_HEADER,
    };

    const h = pe.getFileHeader();
    if (!h) return s;

    s.items = [
        FM.formatU2Field("Machine", h.Machine),
        FM.formatU2Field("NumberOfSections", h.NumberOfSections, true),
        FM.formatU4Field("TimeDateStamp", h.TimeDateStamp),
        FM.formatU4Field("PointerToSymbolTable", h.PointerToSymbolTable),
        FM.formatU4Field("NumberOfSymbols", h.NumberOfSymbols, true),
        FM.formatU2Field("SizeOfOptionalHeader", h.SizeOfOptionalHeader, true),
        FM.formatU2Field("Characteristics", h.Characteristics),
    ];

    return s;
}

function generateOptionalHeader(pe: PEImage): W.GroupedStruct {
    let s: W.GroupedStruct = {
        title: W.KnownTitle.OPTIONAL_HEADER,
        elemID: W.KnownElemID.OPTIONAL_HEADER,
    };

    const h = pe.getOptionalHeader();
    if (!h) return s;

    switch (h.Magic.value) {
        case F.IMAGE_NT_OPTIONAL_HDR32_MAGIC:
            s.title += " (32-bit)";
            fillOptionalHeader32Fields(s, <S.ImageOptionalHeader32>h);
            break;

        case F.IMAGE_NT_OPTIONAL_HDR64_MAGIC:
            s.title += " (64-bit)";
            fillOptionalHeader64Fields(s, <S.ImageOptionalHeader64>h);
            break;
    }

    return s;
}

function fillOptionalHeader32Fields(s: W.GroupedStruct, h: S.ImageOptionalHeader32): void {
    s.groups = [{
        title: "Standard Fields",
        items: [
            FM.formatU2Field("Magic", h.Magic),
            FM.formatU1Field("MajorLinkerVersion", h.MajorLinkerVersion, true),
            FM.formatU1Field("MinorLinkerVersion", h.MinorLinkerVersion, true),
            FM.formatU4Field("SizeOfCode", h.SizeOfCode, true),
            FM.formatU4Field("SizeOfInitializedData", h.SizeOfInitializedData, true),
            FM.formatU4Field("SizeOfUninitializedData", h.SizeOfUninitializedData, true),
            FM.formatU4Field("AddressOfEntryPoint", h.AddressOfEntryPoint),
            FM.formatU4Field("BaseOfCode", h.BaseOfCode),
            FM.formatU4Field("BaseOfData", h.BaseOfData),
        ],
    }, {
        title: "NT-specified Fields",
        items: [
            FM.formatU4Field("ImageBase", h.ImageBase),
            FM.formatU4Field("SectionAlignment", h.SectionAlignment, true),
            FM.formatU4Field("FileAlignment", h.FileAlignment, true),
            FM.formatU2Field("MajorOperatingSystemVersion", h.MajorOperatingSystemVersion, true),
            FM.formatU2Field("MinorOperatingSystemVersion", h.MinorOperatingSystemVersion, true),
            FM.formatU2Field("MajorImageVersion", h.MajorImageVersion, true),
            FM.formatU2Field("MinorImageVersion", h.MinorImageVersion, true),
            FM.formatU2Field("MajorSubsystemVersion", h.MajorSubsystemVersion, true),
            FM.formatU2Field("MinorSubsystemVersion", h.MinorSubsystemVersion, true),
            FM.formatU4Field("Win32VersionValue", h.Win32VersionValue, true),
            FM.formatU4Field("SizeOfImage", h.SizeOfImage, true),
            FM.formatU4Field("SizeOfHeaders", h.SizeOfHeaders, true),
            FM.formatU4Field("CheckSum", h.CheckSum),
            FM.formatU2Field("Subsystem", h.Subsystem),
            FM.formatU2Field("DllCharacteristics", h.DllCharacteristics),
            FM.formatU4Field("SizeOfStackReserve", h.SizeOfStackReserve, true),
            FM.formatU4Field("SizeOfStackCommit", h.SizeOfStackCommit, true),
            FM.formatU4Field("SizeOfHeapReserve", h.SizeOfHeapReserve, true),
            FM.formatU4Field("SizeOfHeapCommit", h.SizeOfHeapCommit, true),
            FM.formatU4Field("LoaderFlags", h.LoaderFlags),
            FM.formatU4Field("NumberOfRvaAndSizes", h.NumberOfRvaAndSizes, true),
        ],
    }];
}

function fillOptionalHeader64Fields(s: W.GroupedStruct, h: S.ImageOptionalHeader64): void {
    s.groups = [{
        title: "Standard Fields",
        items: [
            FM.formatU2Field("Magic", h.Magic),
            FM.formatU1Field("MajorLinkerVersion", h.MajorLinkerVersion, true),
            FM.formatU1Field("MinorLinkerVersion", h.MinorLinkerVersion, true),
            FM.formatU4Field("SizeOfCode", h.SizeOfCode, true),
            FM.formatU4Field("SizeOfInitializedData", h.SizeOfInitializedData, true),
            FM.formatU4Field("SizeOfUninitializedData", h.SizeOfUninitializedData, true),
            FM.formatU4Field("AddressOfEntryPoint", h.AddressOfEntryPoint),
            FM.formatU4Field("BaseOfCode", h.BaseOfCode),
        ],
    }, {
        title: "NT-specified Fields",
        items: [
            FM.formatU8Field("ImageBase", h.ImageBase),
            FM.formatU4Field("SectionAlignment", h.SectionAlignment, true),
            FM.formatU4Field("FileAlignment", h.FileAlignment, true),
            FM.formatU2Field("MajorOperatingSystemVersion", h.MajorOperatingSystemVersion, true),
            FM.formatU2Field("MinorOperatingSystemVersion", h.MinorOperatingSystemVersion, true),
            FM.formatU2Field("MajorImageVersion", h.MajorImageVersion, true),
            FM.formatU2Field("MinorImageVersion", h.MinorImageVersion, true),
            FM.formatU2Field("MajorSubsystemVersion", h.MajorSubsystemVersion, true),
            FM.formatU2Field("MinorSubsystemVersion", h.MinorSubsystemVersion, true),
            FM.formatU4Field("Win32VersionValue", h.Win32VersionValue, true),
            FM.formatU4Field("SizeOfImage", h.SizeOfImage, true),
            FM.formatU4Field("SizeOfHeaders", h.SizeOfHeaders, true),
            FM.formatU4Field("CheckSum", h.CheckSum),
            FM.formatU2Field("Subsystem", h.Subsystem),
            FM.formatU2Field("DllCharacteristics", h.DllCharacteristics),
            FM.formatU8Field("SizeOfStackReserve", h.SizeOfStackReserve, true),
            FM.formatU8Field("SizeOfStackCommit", h.SizeOfStackCommit, true),
            FM.formatU8Field("SizeOfHeapReserve", h.SizeOfHeapReserve, true),
            FM.formatU8Field("SizeOfHeapCommit", h.SizeOfHeapCommit, true),
            FM.formatU4Field("LoaderFlags", h.LoaderFlags),
            FM.formatU4Field("NumberOfRvaAndSizes", h.NumberOfRvaAndSizes, true),
        ],
    }];
}

function generateDataDirectories(pe: PEImage): W.GroupedStruct {
    let s: W.GroupedStruct = {
        title: W.KnownTitle.DATA_DIRECTORIES,
        elemID: W.KnownElemID.DATA_DIRECTORIES,
    };

    const h = pe.getDataDirectories();
    if (!h) return s;

    s.groups = h.items.map((v, i) => ({
        title: `[${i}] ${F.ImageDirectoryEntry[i] || ""}`,
        items: [
            FM.formatU4Field("VirtualAddress", v.VirtualAddress),
            FM.formatU4Field("Size", v.Size, true),
        ]
    } as W.SimpleStruct));

    return s;
}

function generateSectionHeaders(pe: PEImage): W.GroupedStruct {
    let s: W.GroupedStruct = {
        title: W.KnownTitle.SECTION_HEADERS,
        elemID: W.KnownElemID.SECTION_HEADERS,
    };

    const h = pe.getSectionHeaders();
    if (!h) return s;

    s.groups = h.items.map((v, i) => ({
        title: `[${i}] (${v.Name.value})`,
        items: [
            FM.formatStringField("Name", v.Name),
            FM.formatU4Field("VirtualSize", v.VirtualSize, true),
            FM.formatU4Field("VirtualAddress", v.VirtualAddress),
            FM.formatU4Field("SizeOfRawData", v.SizeOfRawData, true),
            FM.formatU4Field("PointerToRawData", v.PointerToRawData),
            FM.formatU4Field("PointerToRelocations", v.PointerToRelocations),
            FM.formatU4Field("PointerToLinenumbers", v.PointerToLinenumbers),
            FM.formatU2Field("NumberOfRelocations", v.NumberOfRelocations, true),
            FM.formatU2Field("NumberOfLinenumbers", v.NumberOfLinenumbers, true),
            FM.formatU4Field("Characteristics", v.Characteristics),
        ]
    } as W.GroupedStruct));

    return s;
}
