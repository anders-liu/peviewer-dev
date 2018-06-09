import { PEImage } from "../pe/image";
import * as S from "../pe/structures";
import * as F from "../pe/image-flags";
import * as FM from "./formatter";
import * as G from "./generator";

export function generateMdsStringsPageData(pe: PEImage,
    cache: G.GeneratorCache, cfg: G.GeneratorConfig,
    pgNum: number): W.MdsStringsPageData {

    checkAndBuildCache(pe, cache, cfg);
    const items = cache.mdsStrings && cache.mdsStrings.pages[pgNum];

    return {
        nav: {
            pageID: W.PageID.MDS_STRINGS,
            title: W.KnownTitle.MDS_STRINGS,
        },
        items: {
            title: W.KnownTitle.MDS_STRINGS,
            items: items && items.map(index =>
                FM.formatStringField(`#String[${FM.formatHexDec(index)}]`, pe.getMdsStringsItem(index)!)
            )
        }
    };
}

function checkAndBuildCache(pe: PEImage, cache: G.GeneratorCache, cfg: G.GeneratorConfig): void {
    if (cache.mdsStrings) return;

    const mdRoot = pe.getMetadataRoot();
    if (!mdRoot) return;

    const sh = pe.getMetadataStreamHeader(F.MetadataStreamName.Strings);
    if (!sh) return;

    // Fetch all #Strings item offsets.
    let indexes: number[] = [0];
    const base = mdRoot._offset + sh.Offset.value;
    for (let p = 1; p < sh.Size.value; p++) {
        if (pe.getU1(base + p - 1) == 0) {
            indexes.push(p);
        }
    }

    // Put into pages.
    let pages: G.MdsStringsPageCache[] = [];
    let pageItems: G.MdsStringsPageCache = [];

    for (let pStart = 0; pStart < indexes.length; pStart++) {
        let pEnd = pStart;
        while (pEnd - pStart <= cfg.mdsStringsPageSize && pEnd < indexes.length) {
            pageItems.push(indexes[pEnd++]);
        }
        pages.push(pageItems.slice());
        pageItems = [];
        pStart = pEnd;
    }

    cache.mdsStrings = { pages };
}