import * as M from "./message";
import { PEImage } from "./pe/image";

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
        const buf = <ArrayBuffer>(<FileReader>ev.target).result;
        pe = PEImage.load(buf);
    };

    reader.onerror = ev => {
        pe = null;
        const msg = M.createResPEErrorMessage("Can't open file.");
        postMessage(msg);
    };

    reader.readAsArrayBuffer(msg.file);
}
