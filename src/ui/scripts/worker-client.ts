/// <reference path="../../worker/worker.d.ts" />

import * as Redux from "redux";

import * as A from "./store/actions";
import * as S from "./store/state";
import * as WM from "./worker-message";

export const workerClientMiddleware = ((store: Redux.MiddlewareAPI<S.AppState>) => (next: Redux.Dispatch<S.AppState>) => (action: Redux.Action) => {
    switch (action.type) {
        case "OPEN_FILE": {
            const { file } = action as A.OpenFileAction;
            _worker.postMessage(WM.createReqOpenFileMessage(file));
            break;
        }
    }
    return next(action);
}) as Redux.Middleware;

export function initWorkerClient(store: Redux.Store<S.AppState>): void {
    _store = store;
    _worker = new Worker("worker.js");
    _worker.onmessage = ev => handleMessage(ev.data);
}

function handleMessage(msg: W.WorkerMessage): void {
    switch (msg.type) {
        case "RES_NAV_DATA": break;
        case "RES_PAGE_DATA": break;
        case "RES_PE_ERROR": break;
    }
}

let _worker: Worker;
let _store: Redux.Store<S.AppState>;