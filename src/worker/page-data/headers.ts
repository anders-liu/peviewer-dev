import { PEImage } from "../pe/image";
import * as FM from "./formatter";

export function generateHeadersPageData(pe: PEImage): W.HeadersPageData {
    return {
        id: W.PageID.HEADERS,
        title: "Headers",
        dosHeader: generateDosHeader(pe),
        peSignature: generatePESignature(pe),
        fileHeader: generateFileHeader(pe),
        optionalHeader: generateOptionalHeader(pe),
        sectionHeaders: generateSectionHeaders(pe),
    };
}

function generateDosHeader(pe: PEImage): W.SimpleStruct {
    let s: W.SimpleStruct = { title: "DOS Header" };

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
    let s: W.SimpleStruct = { title: "PE Signature" };

    // TODO
    return s;
}

function generateFileHeader(pe: PEImage): W.SimpleStruct {
    let s: W.SimpleStruct = { title: "File Header" };

    // TODO
    return s;
}

function generateOptionalHeader(pe: PEImage): W.GroupedStruct {
    let s: W.SimpleStruct = { title: "Optional Header" };

    // TODO
    return s;
}

function generateSectionHeaders(pe: PEImage): W.GroupedStruct {
    let s: W.SimpleStruct = { title: "Section headers" };

    // TODO
    return s;
}
