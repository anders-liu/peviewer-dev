import { PEImage } from "../pe/image";
import * as F from "../pe/image-flags";
import * as S from "../pe/structures";
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

export function generateMdtPageData(
    pe: PEImage,
    tid: F.MetadataTableIndex,
    cfg: G.GeneratorConfig,
    pgNum: number): W.PagedItemListPageData {
    const ti = F.MetadataTableIndex;
    const title = ti[tid] + " Table";

    return {
        nav: {
            pageID: W.PageID.MDT_TBL,
            subID: ti[tid],
            title,
        },
        items: generateTalbeItems(pe, tid, cfg, pgNum, title),
        paging: generateMdtPaging(pe, tid, cfg, pgNum)
    };
}

function generateTalbeItems(
    pe: PEImage,
    tid: F.MetadataTableIndex,
    cfg: G.GeneratorConfig,
    pgNum: number,
    title: string): W.GroupedStruct {
    const { start, end } = getRidOnPage(pe, tid, cfg, pgNum);
    switch (tid) {
        case F.MetadataTableIndex.Module:
            return generateMdtModuleItems(pe, title, start, end);
        case F.MetadataTableIndex.TypeDef:
            return generateMdtTypeDefItems(pe, title, start, end);
        default:
            return { title };
    }
}

function generateMdtModuleItems(
    pe: PEImage, title: string, start: number, end: number): W.GroupedStruct {
    let items: S.MdtModuleItem[] = [];
    for (let rid = start; rid <= end; rid++) {
        items.push(pe.getMdtModuleItem(rid)!);
    }

    return {
        title,
        groups: items.map((v, i) => ({
            title: `Module[${FM.formatHexDec(start + i)}]`,
            items: [
                FM.formatU2Field("Generation", v.Generation),
                FM.formatU4Field("Name", v.Name),
                FM.formatU4Field("Mvid", v.Mvid),
                FM.formatU4Field("EncId", v.EncId),
                FM.formatU4Field("EncBaseId", v.EncBaseId),
            ]
        }))
    };
}

function generateMdtTypeDefItems(
    pe: PEImage, title: string, start: number, end: number): W.GroupedStruct {
    let items: S.MdtTypeDefItem[] = [];
    for (let rid = start; rid <= end; rid++) {
        items.push(pe.getMdtTypeDefItem(rid)!);
    }

    return {
        title,
        groups: items.map((v, i) => ({
            title: `TypeDef[${FM.formatHexDec(start + i)}]`,
            items: [
                FM.formatU4Field("Flags", v.Flags),
                FM.formatU4Field("Name", v.Name),
                FM.formatU4Field("Namespace", v.Namespace),
                FM.formatU4Field("Extends", v.Extends),
                FM.formatU4Field("FieldList", v.FieldList),
                FM.formatU4Field("MethodList", v.MethodList),
            ]
        }))
    };
}

function generateMdtPaging(
    pe: PEImage,
    tid: F.MetadataTableIndex,
    cfg: G.GeneratorConfig,
    pgNum: number): W.Paging {
    const paging: W.Paging = {
        currentPageNumber: pgNum,
        pageNavList: []
    };

    const psz = cfg.mdtPageSize;
    const rows = pe.getMetadataTableRows(tid);
    const pages = Math.floor((rows + psz - 1) / psz);
    for (let p = 0; p < pages; p++) {
        const tblName = F.MetadataTableIndex[tid];
        const titleOf = (r: number) => `${tblName}[${FM.formatHexDec(r)}]`;
        const { start, end } = getRidOnPage(pe, tid, cfg, p);
        const target: W.NavTarget = {
            title: `Page[${p + 1}] (${titleOf(start)} - ${titleOf(end)})`,
            pageID: W.PageID.MDT_TBL,
            subID: tblName,
            pageNum: p,
        };
        paging.pageNavList.push(target);
    }

    return paging;
}

function getRidOnPage(
    pe: PEImage,
    tid: F.MetadataTableIndex,
    cfg: G.GeneratorConfig,
    pgNum: number): { start: number, end: number } {
    const psz = cfg.mdtPageSize;
    const rows = pe.getMetadataTableRows(tid);
    const start = pgNum * psz + 1;
    let end = start + psz - 1;
    if (end > rows) end = rows;
    return { start, end };
}