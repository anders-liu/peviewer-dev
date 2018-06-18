/// <reference path="../../worker/worker.d.ts" />

import * as Redux from "redux";

import * as A from "./store/actions";
import * as S from "./store/state";
import * as WM from "./worker-message";

export const workerClientMiddleware = ((store: Redux.MiddlewareAPI<S.AppState>) => (next: Redux.Dispatch<S.AppState>) => (action: Redux.Action) => {
    switch (action.type) {
        case A.ActionType.OPEN_FILE: {
            const { file } = action as A.OpenFileAction;
            _worker.postMessage(WM.createReqOpenFileMessage(file));
            break;
        }

        case A.ActionType.OPEN_NAV: {
            const { target } = action as A.OpenNavAction;
            const { pageData } = store.getState();
            const { pageID, pageNum } = target;
            if (!pageData || pageData.nav.pageID != pageID || pageData.nav.pageNum != pageNum) {
                _worker.postMessage(WM.createReqOpenNavMessage(target));
            }
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
        case W.WorkerMessageType.RES_NAV_DATA:
            const { navList } = <W.ResNavDataMessage>msg;
            _store.dispatch(A.createSetNavListAction(navList));
            break;

        case W.WorkerMessageType.RES_PAGE_DATA:
            const { pageData } = <W.ResPageDataMessage>msg;
            _store.dispatch(A.createSetPageDataAction(pageData));
            break;

        case W.WorkerMessageType.RES_PE_PROPS:
            const { is32Bit, isManaged } = <W.ResPEPropsMessage>msg;
            _store.dispatch(A.createSetPEPropsAction(is32Bit, isManaged));
            break;

        case W.WorkerMessageType.RES_PE_ERROR:
            const { error } = <W.ResPEErrorMessage>msg;
            _store.dispatch(A.createSetWorkerErrorAction(error));
            break;
    }
}

let _worker: Worker;
let _store: Redux.Store<S.AppState>;
