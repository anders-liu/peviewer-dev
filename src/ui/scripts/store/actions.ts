import * as Redux from "redux";

export const enum ActionType {
    OPEN_FILE = "OPEN_FILE",
    SET_PAGE_DATA = "SET_PAGE_DATA",
    SET_WORKER_ERROR = "SET_WORKER_ERROR",
}

export interface OpenFileAction extends Redux.Action {
    file: File;
}

export function createOpenFileAction(file: File): OpenFileAction {
    return {
        type: ActionType.OPEN_FILE,
        file
    };
}

export interface SetPageDataAction extends Redux.Action {
    data: W.PageData;
}

export function createSetPageDataAction(data: W.PageData): SetPageDataAction {
    return {
        type: ActionType.SET_PAGE_DATA,
        data
    };
}