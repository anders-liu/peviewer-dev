/// <reference path="../../worker/worker.d.ts" />

export function createReqOpenFileMessage(file: File): W.ReqOpenFileMessage {
    return {
        type: W.WorkerMessageType.REQ_OPEN_FILE,
        file
    };
}
