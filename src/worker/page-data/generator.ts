import { PEImage } from "../pe/image";
import { generateHeadersPageData } from "./headers";
import { generateMetadataHeadersPageData } from "./metadata-headers";

export function generatePageData(pe: PEImage, pageID: W.PageID): W.PageData {
    switch (pageID) {
        case W.PageID.HEADERS: return generateHeadersPageData(pe);
        case W.PageID.MD_HEADERS: return generateMetadataHeadersPageData(pe);
        default: return { nav: { pageID: W.PageID.NOTFOUND, title: W.KnownTitle.NOTFOUND } };
    }
}