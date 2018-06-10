import { PEImage } from "../pe/image";
import { generateHeadersPageData } from "./headers";
import { generateMetadataHeadersPageData } from "./metadata-headers";
import { generateMdsTablePageData } from "./mds-table";
import {
    generateMdsStringsPageData,
    generateMdsUSPageData,
    generateMdsGuidPageData,
    generateMdsBlobPageData
} from "./mds-list";

export function generatePageData(pe: PEImage, pageID: W.PageID, pageNum?: number): W.PageData {
    switch (pageID) {
        case W.PageID.HEADERS: return generateHeadersPageData(pe);
        case W.PageID.MD_HEADERS: return generateMetadataHeadersPageData(pe);
        case W.PageID.MDS_TABLE: return generateMdsTablePageData(pe);
        case W.PageID.MDS_STRINGS: return generateMdsStringsPageData(pe, cache, cfg, pageNum || 0);
        case W.PageID.MDS_US: return generateMdsUSPageData(pe, cache, cfg, pageNum || 0);
        case W.PageID.MDS_GUID: return generateMdsGuidPageData(pe);
        case W.PageID.MDS_BLOB: return generateMdsBlobPageData(pe, cache, cfg, pageNum || 0);
        default: return { nav: { pageID: W.PageID.NOTFOUND, title: W.KnownTitle.NOTFOUND } };
    }
}

export interface GeneratorCache {
    mdsStrings?: MdsOffsetListCache;
    mdsUS?: MdsOffsetListCache;
    mdsBlob?: MdsOffsetListCache;
}

export type MdsOffsetListCache = {
    pages: MdsOffsetListPageCache[];
}

export type MdsOffsetListPageCache = number[];

export function clearGeneratorCache(): void {
    cache = {};
}

export interface GeneratorConfig {
    mdsOffsetListPageSize: number;
}

let cache: GeneratorCache = {};

const cfg: GeneratorConfig = {
    mdsOffsetListPageSize: 5000,  // Total bytes per page.
}