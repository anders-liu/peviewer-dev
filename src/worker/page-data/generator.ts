import { PEImage } from "../pe/image";
import { generateHeadersPageData } from "./headers";

export function generatePageData(pe: PEImage, pageID: W.PageID): W.PageData {
    switch (pageID) {
        case W.PageID.HEADERS: return generateHeadersPageData(pe);
        default: return { id: W.PageID.NOTFOUND, title: "Page Not Found" };
    }
}