import * as M from "./message";
import { PEImage } from "./pe/image";
import { generatePageData, clearGeneratorCache } from "./page-data/generator";
import { generateNavList } from "./page-data/nav-data";

let pe: PEImage | null = null;

onmessage = (ev) => {
    const msg = ev.data as W.WorkerMessage;
    switch (msg.type) {
        case W.WorkerMessageType.REQ_OPEN_FILE:
            handleReqOpenFile(msg as W.ReqOpenFileMessage);
            break;

        case W.WorkerMessageType.REQ_OPEN_NAV:
            handleReqOpenNav(msg as W.ReqOpenNavMessage);
            break;
    }
};

function handleReqOpenFile(msg: W.ReqOpenFileMessage): void {
    let reader = new FileReader();

    reader.onload = ev => {
        try {
            const buf = <ArrayBuffer>(<FileReader>ev.target).result;
            pe = PEImage.load(buf);
            clearGeneratorCache();

            // Response with page data.
            const pageData = generatePageData(pe, W.PageID.HEADERS);
            const pageDataMsg = M.createResPageDataMessage(pageData);
            postMessage(pageDataMsg);

            // Response with PE properties.
            const is32Bit = pe.is32Bit();
            const isManaged = pe.isManaged();
            const pePropsMsg = M.createResPEPropsMessage(is32Bit, isManaged);
            postMessage(pePropsMsg);

            // Response with navigation data.
            const navList = generateNavList(pe);
            const navMsg = M.createResNavDataMessage(navList);
            postMessage(navMsg);
        } catch (ex) {
            const msg = M.createResPEErrorMessage(ex.message
                || `Unknown error: ${JSON.stringify(ex)}`);
            postMessage(msg);
        }
    };

    reader.onerror = ev => {
        pe = null;
        const msg = M.createResPEErrorMessage("Can't open file.");
        postMessage(msg);
    };

    reader.readAsArrayBuffer(msg.file);
}

function handleReqOpenNav(msg: W.ReqOpenNavMessage): void {
    if (pe != null) {
        const { pageID, pageNum, elemID } = msg.target;
        const pageData = generatePageData(pe, pageID, pageNum);
        pageData.nav.elemID = elemID;
        const res = M.createResPageDataMessage(pageData);
        postMessage(res);
    }
}