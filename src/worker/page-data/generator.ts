import { PEImage } from "../pe/image";
import { generateHeadersPageData } from "./headers";
import { generateMetadataHeadersPageData } from "./metadata-headers";
import { generateMdsTablePageData } from "./mds-table";
import { generateMdsStringsPageData } from "./mds-strings";

export function generatePageData(pe: PEImage, pageID: W.PageID, pageNum?: number): W.PageData {
    switch (pageID) {
        case W.PageID.HEADERS: return generateHeadersPageData(pe);
        case W.PageID.MD_HEADERS: return generateMetadataHeadersPageData(pe);
        case W.PageID.MDS_TABLE: return generateMdsTablePageData(pe);
        case W.PageID.MDS_STRINGS: return generateMdsStringsPageData(pe, cache, cfg, pageNum!);
        default: return { nav: { pageID: W.PageID.NOTFOUND, title: W.KnownTitle.NOTFOUND } };
    }
}

export interface GeneratorCache {
    mdsStrings?: MdsStringsCache;
}

export type MdsStringsCache = {
    pages: MdsStringsPageCache[];
}

export type MdsStringsPageCache = number[];

export function clearGeneratorCache(): void {
    cache = {};
}

export interface GeneratorConfig {
    mdsStringsPageSize: number;
}

let cache: GeneratorCache = {};

const cfg: GeneratorConfig = {
    mdsStringsPageSize: 1000,  // Total bytes per page.
}