import { PEImage } from "../pe/image";
import * as F from "../pe/image-flags";

export function generateNavList(pe: PEImage): W.NavData[] {
    let navList: W.NavData[] = [generateHeadersNavData(pe)];

    const navMD = generateMDHeadersNavData(pe);
    if (navMD) navList.push(navMD);

    const navMDT = generateMDTablesNavData(pe);
    if (navMDT) navList.push(navMDT);

    return navList;
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
            target: { pageID, title: W.KnownTitle.SECTION_HEADERS, elemID: W.KnownElemID.SECTION_HEADERS }
        }]
    };
}

function generateMDHeadersNavData(pe: PEImage): W.NavData | undefined {
    const pageID = W.PageID.MD_HEADERS;

    if (!pe.isManaged()) return undefined;

    let children: W.NavData[] = [{
        target: { pageID, title: W.KnownTitle.CLI_HEADER, elemID: W.KnownElemID.CLI_HEADER }
    }];

    if (pe.hasMetadata()) {
        children.push({
            target: { pageID, title: W.KnownTitle.MD_ROOT, elemID: W.KnownElemID.MD_ROOT }
        });
        children.push({
            target: { pageID, title: W.KnownTitle.MDS_HEADERS, elemID: W.KnownElemID.MDS_HEADERS }
        });
    }

    if (pe.hasStrongNameSignature()) {
        children.push({
            target: { pageID, title: W.KnownTitle.SN_SIG, elemID: W.KnownElemID.SN_SIG }
        });
    }

    if (pe.getMetadataStreamHeader(F.MetadataStreamName.Strings)) {
        children.push({
            target: { pageID: W.PageID.MDS_STRINGS, title: W.KnownTitle.MDS_STRINGS, pageNum: 0 }
        });
    }

    if (pe.getMetadataStreamHeader(F.MetadataStreamName.US)) {
        children.push({
            target: { pageID: W.PageID.MDS_US, title: W.KnownTitle.MDS_US, pageNum: 0 }
        });
    }

    if (pe.getMetadataStreamHeader(F.MetadataStreamName.GUID)) {
        children.push({
            target: { pageID: W.PageID.MDS_GUID, title: W.KnownTitle.MDS_GUID, pageNum: 0 }
        });
    }

    if (pe.getMetadataStreamHeader(F.MetadataStreamName.Blob)) {
        children.push({
            target: { pageID: W.PageID.MDS_BLOB, title: W.KnownTitle.MDS_BLOB, pageNum: 0 }
        });
    }

    return {
        target: { pageID, title: W.KnownTitle.MD_HEADERS },
        children
    };
}

function generateMDTablesNavData(pe: PEImage): W.NavData | undefined {
    const pageID = W.PageID.MDS_TABLE;
    const h = pe.getMetadataTableHeader();
    if (!h) return undefined;

    return {
        target: { pageID, title: W.KnownTitle.MDS_TABLE },
    };
}