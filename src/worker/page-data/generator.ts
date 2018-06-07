import { PEImage } from "../pe/image";
import { generateHeadersPageData } from "./headers";
import { generateMetadataHeadersPageData } from "./metadata-headers";
import { generateMdsTablePageData } from "./mds-table";

export function generatePageData(pe: PEImage, pageID: W.PageID): W.PageData {
    switch (pageID) {
        case W.PageID.HEADERS: return generateHeadersPageData(pe);
        case W.PageID.MD_HEADERS: return generateMetadataHeadersPageData(pe);
        case W.PageID.MDS_TABLE: return generateMdsTablePageData(pe);
        default: return { nav: { pageID: W.PageID.NOTFOUND, title: W.KnownTitle.NOTFOUND } };
    }
}