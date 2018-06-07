import { PEImage } from "../pe/image";
import * as S from "../pe/structures";
import * as F from "../pe/image-flags";
import * as FM from "./formatter";

export function generateMdsTablePageData(pe: PEImage): W.MdsTablePageData {
    return {
        nav: {
            pageID: W.PageID.MDS_TABLE,
            title: W.KnownTitle.MDS_TABLE,
        },
        mdTableHeader: generateMDTableHeader(pe),
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