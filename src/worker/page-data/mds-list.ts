import { PEImage } from "../pe/image";
import * as S from "../pe/structures";
import * as F from "../pe/image-flags";
import * as U from "../pe/utils";
import * as FM from "./formatter";
import * as G from "./generator";

export function generateMdsStringsPageData(pe: PEImage,
    cache: G.GeneratorCache, cfg: G.GeneratorConfig,
    pgNum: number): W.PagedItemListPageData {

    checkAndBuildCacheForMdsStrings(pe, cache, cfg);
    const items = cache.mdsStrings && cache.mdsStrings.pages[pgNum];

    const titleOf = (i: number) => `#String[${FM.formatHexDec(i)}]`;

    return {
        nav: {
            pageID: W.PageID.MDS_STRINGS,
            title: W.KnownTitle.MDS_STRINGS,
        },
        items: {
            title: W.KnownTitle.MDS_STRINGS,
            groups: [{
                title: "",
                items: items && items.map(index =>
                    FM.formatStringField(titleOf(index), pe.getMdsStringsItem(index)!)
                )
            }]
        },
        paging: {
            currentPageNumber: pgNum,
            pageNavList: cache.mdsStrings!.pages.map((v, i) => ({
                title: `Page[${i + 1}] (${titleOf(v[0])} - ${titleOf(v[v.length - 1])}})`,
                pageID: W.PageID.MDS_STRINGS,
                pageNum: i
            }))
        }
    };
}

export function generateMdsUSPageData(pe: PEImage,
    cache: G.GeneratorCache, cfg: G.GeneratorConfig,
    pgNum: number): W.PagedItemListPageData {

    checkAndBuildCacheForMdsUS(pe, cache, cfg);
    const items = cache.mdsUS && cache.mdsUS.pages[pgNum];

    const titleOf = (i: number) => `#US[${FM.formatHexDec(i)}]`;

    return {
        nav: {
            pageID: W.PageID.MDS_US,
            title: W.KnownTitle.MDS_US,
        },
        items: {
            title: W.KnownTitle.MDS_US,
            groups: items && items.map(index => {
                const item = pe.getMdsUSItem(index)!;
                return {
                    title: titleOf(index),
                    items: [
                        FM.formatCompressedUIntField("Size", item.Size),
                        FM.formatStringField("Value", item.Value),
                        FM.formatBytesField("Suffix", item.Suffix),
                    ]
                }
            })
        },
        paging: {
            currentPageNumber: pgNum,
            pageNavList: cache.mdsUS!.pages.map((v, i) => ({
                title: `Page[${i + 1}] (${titleOf(v[0])} - ${titleOf(v[v.length - 1])}})`,
                pageID: W.PageID.MDS_US,
                pageNum: i
            }))
        }
    };
}

export function generateMdsBlobPageData(pe: PEImage,
    cache: G.GeneratorCache, cfg: G.GeneratorConfig,
    pgNum: number): W.PagedItemListPageData {

    checkAndBuildCacheForMdsBlob(pe, cache, cfg);
    const items = cache.mdsBlob && cache.mdsBlob.pages[pgNum];

    const titleOf = (i: number) => `#Blob[${FM.formatHexDec(i)}]`;

    return {
        nav: {
            pageID: W.PageID.MDS_BLOB,
            title: W.KnownTitle.MDS_BLOB,
        },
        items: {
            title: W.KnownTitle.MDS_BLOB,
            groups: items && items.map(index => {
                const item = pe.getMdsBlobItem(index)!;
                return {
                    title: titleOf(index),
                    items: [
                        FM.formatCompressedUIntField("Size", item.Size),
                        FM.formatBytesField("Value", item.Value),
                    ]
                }
            })
        },
        paging: {
            currentPageNumber: pgNum,
            pageNavList: cache.mdsBlob!.pages.map((v, i) => ({
                title: `Page[${i + 1}] (${titleOf(v[0])} - ${titleOf(v[v.length - 1])}})`,
                pageID: W.PageID.MDS_BLOB,
                pageNum: i
            }))
        }
    };
}

export function generateMdsGuidPageData(pe: PEImage): W.PagedItemListPageData {
    const titleOf = (i: number) => `#GUID[${FM.formatHexDec(i)}]`;
    return {
        nav: {
            pageID: W.PageID.MDS_GUID,
            title: W.KnownTitle.MDS_GUID,
        },
        items: {
            title: W.KnownTitle.MDS_GUID,
            groups: [{
                title: "",
                items: pe.getMdsGuidItems()!.items.map((v, i) =>
                    FM.formatGuidField(titleOf(i + 1), v))
            }]
        },
    };
}

function checkAndBuildCacheForMdsStrings(pe: PEImage, cache: G.GeneratorCache, cfg: G.GeneratorConfig): void {
    if (cache.mdsStrings) return;

    const mdRoot = pe.getMetadataRoot();
    if (!mdRoot) return;

    const sh = pe.getMetadataStreamHeader(F.MetadataStreamName.Strings);
    if (!sh) return;

    let indexes: number[] = [0];
    const base = mdRoot._offset + sh.Offset.value;
    for (let p = 1; p < sh.Size.value; p++) {
        if (pe.getU1(base + p - 1) == 0) {
            indexes.push(p);
        }
    }

    cache.mdsStrings = {
        pages: putIndexToPages(indexes, cfg.mdsOffsetListPageSize)
    };
}

function checkAndBuildCacheForMdsUS(pe: PEImage, cache: G.GeneratorCache, cfg: G.GeneratorConfig): void {
    if (cache.mdsUS) return;

    const mdRoot = pe.getMetadataRoot();
    if (!mdRoot) return;

    const sh = pe.getMetadataStreamHeader(F.MetadataStreamName.US);
    if (!sh) return;

    const indexes = getBlobIndexes(pe, mdRoot._offset + sh.Offset.value, sh.Size.value);

    cache.mdsUS = {
        pages: putIndexToPages(indexes, cfg.mdsOffsetListPageSize)
    };
}

function checkAndBuildCacheForMdsBlob(pe: PEImage, cache: G.GeneratorCache, cfg: G.GeneratorConfig): void {
    if (cache.mdsBlob) return;

    const mdRoot = pe.getMetadataRoot();
    if (!mdRoot) return;

    const sh = pe.getMetadataStreamHeader(F.MetadataStreamName.Blob);
    if (!sh) return;

    const indexes = getBlobIndexes(pe, mdRoot._offset + sh.Offset.value, sh.Size.value);

    cache.mdsBlob = {
        pages: putIndexToPages(indexes, cfg.mdsOffsetListPageSize)
    };
}

function getBlobIndexes(pe: PEImage, base: number, size: number): number[] {
    let indexes: number[] = [];
    let p = 0;

    while (p < size) {
        indexes.push(p);
        const dtsz = U.getCompressedIntSize(pe.getU1(base + p));
        const szval = U.decompressUint(pe.getData(base + p, dtsz));
        p += szval + dtsz;
    }

    return indexes;
}

function putIndexToPages(indexes: number[], pageSize: number): G.MdsOffsetListPageCache[] {
    let pages: G.MdsOffsetListPageCache[] = [];
    let pageItems: G.MdsOffsetListPageCache = [];

    for (let pStart = 0, pEnd = 0; pStart < indexes.length; pStart = pEnd) {
        while (indexes[pEnd] - indexes[pStart] < pageSize
            && pEnd < indexes.length) {
            pageItems.push(indexes[pEnd++]);
        }
        pages.push(pageItems.slice());
        pageItems = [];
    }

    return pages;
}