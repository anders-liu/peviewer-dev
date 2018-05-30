import * as M from "./message";
import { PEImage } from "./pe/image";
import { generatePageData } from "./page-data/generator";

let pe: PEImage | null = null;

onmessage = (ev) => {
    const msg = ev.data as W.WorkerMessage;
    switch (msg.type) {
        case W.WorkerMessageType.REQ_OPEN_FILE:
            handleReqOpenFile(msg as W.ReqOpenFileMessage);
            break;
    }
};

function handleReqOpenFile(msg: W.ReqOpenFileMessage): void {
    let reader = new FileReader();

    reader.onload = ev => {
        try {
            const buf = <ArrayBuffer>(<FileReader>ev.target).result;
            pe = PEImage.load(buf);
            const pageData = generatePageData(pe, W.PageID.HEADERS);
            const msg = M.createResPageDataMessage(pageData);
            postMessage(msg);
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
