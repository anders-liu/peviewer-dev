import * as Redux from "redux";

export type ActionType
    = "OPEN_FILE"
    | "SET_PAGE_DATA"
    | "SET_WORKER_ERROR"
    ;

export interface OpenFileAction extends Redux.Action {
    file: File;
}

export function createOpenFileAction(file: File): OpenFileAction {
    return {
        type: "OPEN_FILE",
        file
    };
}