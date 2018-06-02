import { PEImage } from "../pe/image";
import { generateHeadersPageData } from "./headers";

export function generatePageData(pe: PEImage, pageID: W.PageID): W.PageData {
    switch (pageID) {
        case W.PageID.HEADERS: return generateHeadersPageData(pe);
        default: return { nav: { pageID: W.PageID.NOTFOUND, title: W.KnownTitle.NOTFOUND } };
    }
}