import { PEImage } from "../pe/image";
import { generateHeadersPageData } from "./headers";

export function generatePageData(pe: PEImage, pageID: W.PageID): W.PageData | undefined {
    switch (pageID) {
        case W.PageID.HEADERS:
            return generateHeadersPageData(pe);
    }
}