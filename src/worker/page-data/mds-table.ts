import { PEImage } from "../pe/image";
import * as F from "../pe/image-flags";
import * as FM from "./formatter";
import * as G from "./generator";

export function generateMdsTablePageData(pe: PEImage): W.MdsTablePageData {
    return {
        nav: {
            pageID: W.PageID.MDS_TABLE,
            title: W.KnownTitle.MDS_TABLE,
        },
        tableHeader: generateMDTableHeader(pe),
        tableInfo: generateMDTableList(pe),
    };
}

function generateMDTableHeader(pe: PEImage): W.GroupedStruct {
    let s: W.GroupedStruct = {
        title: W.KnownTitle.MDT_HEADER,
        elemID: W.KnownElemID.MDT_HEADER,
    };

    const h = pe.getMetadataTableHeader();
    if (!h) return s;

    s.groups = [{
        title: "",
        items: [
            FM.formatU4Field("Reserved", h.Reserved),
            FM.formatU1Field("MajorVersion", h.MajorVersion, true),
            FM.formatU1Field("MinorVersion", h.MinorVersion, true),
            FM.formatU1Field("HeapSizes", h.HeapSizes),
            FM.formatU1Field("Reserved2", h.Reserved2),
            FM.formatU8Field("Valid", h.Valid),
            FM.formatU8Field("Sorted", h.Sorted),
        ]
    }, {
        title: "Rows",
        items: h.Rows.items.map((v, i) => FM.formatU4Field(`Rows[${i}]`, v, true))
    }];

    return s;
}

function generateMDTableList(pe: PEImage): W.MdTableInfo[] {
    let s: W.MdTableInfo[] = [];
    for (let id = 0; id < F.NumberOfMdTables; id++) {
        s.push({
            index: `${FM.formatU1Hex(id)} (${FM.formatDec(id)})`,
            name: F.MetadataTableIndex[id],
            valid: pe.isMetadataTableValid(id),
            sorted: pe.isMetadataTableSorted(id),
            rows: FM.formatDec(pe.getMetadataTableRows(id)),
        });
    }
    return s;
}

export function generateMdtModulePageData(
    pe: PEImage,
    cfg: G.GeneratorConfig,
    pgNum: number): W.PagedItemListPageData {
    return {
        nav: {
            pageID: W.PageID.MDT_MODULE,
            title: W.KnownTitle.MDT_MODULE
        },
        items: {
            title: W.KnownTitle.MDT_MODULE,
        }
    };
}