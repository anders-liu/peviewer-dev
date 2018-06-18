import { PEImage } from "../pe/image";
import * as FM from "./formatter";

export function generateMetadataHeadersPageData(pe: PEImage): W.MetadataHeadersPageData {
    return {
        nav: {
            pageID: W.PageID.MD_HEADERS,
            title: W.KnownTitle.MD_HEADERS,
        },
        cliHeader: generateCliHeader(pe),
        metadataRoot: generateMetadataRoot(pe),
        streamHeaders: generateMetadataStreamHeader(pe),
        snSignature: generateSNSignature(pe),
    };
}

function generateCliHeader(pe: PEImage): W.SimpleStruct {
    let s: W.SimpleStruct = {
        title: W.KnownTitle.CLI_HEADER,
        elemID: W.KnownElemID.CLI_HEADER,
    };

    const h = pe.getCliHeader();
    if (!h) return s;

    s.items = [
        FM.formatU4Field("cb", h.cb, true),
        FM.formatU2Field("MajorRuntimeVersion", h.MajorRuntimeVersion, true),
        FM.formatU2Field("MinorRuntimeVersion", h.MinorRuntimeVersion, true),
        FM.formatRvaField("MetaData.VirtualAddress", h.MetaData.VirtualAddress, pe, {
            title: W.KnownTitle.MD_ROOT,
            pageID: W.PageID.MD_HEADERS,
            elemID: W.KnownElemID.MD_ROOT
        }),
        FM.formatU4Field("MetaData.Size", h.MetaData.Size, true),
        FM.formatU4Field("Flags", h.Flags),
        FM.formatU4Field("EntryPointToken", h.EntryPointToken),
        FM.formatRvaField("Resources.VirtualAddress", h.Resources.VirtualAddress, pe),
        FM.formatU4Field("Resources.Size", h.Resources.Size, true),
        FM.formatRvaField("StrongNameSignature.VirtualAddress", h.StrongNameSignature.VirtualAddress, pe, {
            title: W.KnownTitle.SN_SIG,
            pageID: W.PageID.MD_HEADERS,
            elemID: W.KnownElemID.SN_SIG
        }),
        FM.formatU4Field("StrongNameSignature.Size", h.StrongNameSignature.Size, true),
        FM.formatRvaField("CodeManagerTable.VirtualAddress", h.CodeManagerTable.VirtualAddress, pe),
        FM.formatU4Field("CodeManagerTable.Size", h.CodeManagerTable.Size, true),
        FM.formatRvaField("VTableFixups.VirtualAddress", h.VTableFixups.VirtualAddress, pe),
        FM.formatU4Field("VTableFixups.Size", h.VTableFixups.Size, true),
        FM.formatRvaField("ExportAddressTableJumps.VirtualAddress", h.ExportAddressTableJumps.VirtualAddress, pe),
        FM.formatU4Field("ExportAddressTableJumps.Size", h.ExportAddressTableJumps.Size, true),
        FM.formatRvaField("ManagedNativeHeader.VirtualAddress", h.ManagedNativeHeader.VirtualAddress, pe),
        FM.formatU4Field("ManagedNativeHeader.Size", h.ManagedNativeHeader.Size, true),
    ];

    return s;
}

function generateSNSignature(pe: PEImage): W.SimpleStruct | undefined {
    const d = pe.getStrongNameSignature();
    if (!d) return undefined;

    const s: W.SimpleStruct = {
        title: W.KnownTitle.SN_SIG,
        elemID: W.KnownElemID.SN_SIG,
        items: [FM.formatBytesField("Signature", d)]
    };
    return s;
}

function generateMetadataRoot(pe: PEImage): W.SimpleStruct | undefined {
    const h = pe.getMetadataRoot();
    if (!h) return undefined;

    const s: W.SimpleStruct = {
        title: W.KnownTitle.MD_ROOT,
        elemID: W.KnownElemID.MD_ROOT,
        items: [
            FM.formatU4Field("Signature", h.Signature),
            FM.formatU2Field("MajorVersion", h.MajorVersion, true),
            FM.formatU2Field("MinorVersion", h.MinorVersion, true),
            FM.formatU4Field("Reserved", h.Reserved),
            FM.formatU4Field("VersionLength", h.VersionLength, true),
            FM.formatStringField("VersionString", h.VersionString),
            FM.formatBytesField("VersionPadding", h.VersionPadding),
            FM.formatU2Field("Flags", h.Flags),
            FM.formatU2Field("Streams", h.Streams, true),
        ]
    };
    return s;
}

function generateMetadataStreamHeader(pe: PEImage): W.GroupedStruct | undefined {
    const h = pe.getMetadataStreamHeaders();
    if (!h) return undefined;

    const s: W.GroupedStruct = {
        title: W.KnownTitle.MDS_HEADERS,
        elemID: W.KnownElemID.MDS_HEADERS,
        groups: h.items.map((v, i) => ({
            title: `[${i}] (${v.Name.value})`,
            items: [
                FM.formatU4Field("Offset", v.Offset),
                FM.formatU4Field("Size", v.Size, true),
                FM.formatStringField("Name", v.Name),
                FM.formatBytesField("Padding", v.Padding),
            ]
        }))
    };
    return s;
}