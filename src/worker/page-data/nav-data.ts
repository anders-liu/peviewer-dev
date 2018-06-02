import { PEImage } from "../pe/image";

export function generateNavList(pe: PEImage): W.NavData[] {
    return [
        generateHeadersNavData(pe)
    ];
}

function generateHeadersNavData(pe: PEImage): W.NavData {
    const pageID = W.PageID.HEADERS;

    return {
        target: { pageID, title: W.KnownTitle.HEADERS },
        children: [{
            target: { pageID, title: W.KnownTitle.DOS_HEADER, elemID: W.KnownElemID.DOS_HEADER }
        }, {
            target: { pageID, title: W.KnownTitle.PE_SIGNATURE, elemID: W.KnownElemID.PE_SIGNATURE }
        }, {
            target: { pageID, title: W.KnownTitle.FILE_HEADER, elemID: W.KnownElemID.FILE_HEADER }
        }, {
            target: { pageID, title: W.KnownTitle.OPTIONAL_HEADER, elemID: W.KnownElemID.OPTIONAL_HEADER }
        }, {
            target: { pageID, title: W.KnownTitle.DATA_DIRECTORIES, elemID: W.KnownElemID.DATA_DIRECTORIES }
        }, {
            target: { pageID, title: W.KnownTitle.SECTION_HEADERS, elemID: W.KnownElemID.SECTION_HEADER }
        }]
    };
}