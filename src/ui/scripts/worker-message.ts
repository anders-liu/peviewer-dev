/// <reference path="../../worker/worker.d.ts" />

export function createReqOpenFileMessage(file: File): W.ReqOpenFileMessage {
    return {
        type: W.WorkerMessageType.REQ_OPEN_FILE,
        file
    };
}

export function createReqOpenNavMessage(target: W.NavTarget): W.ReqOpenNavMessage {
    return {
        type: W.WorkerMessageType.REQ_OPEN_NAV,
        target
    };
}