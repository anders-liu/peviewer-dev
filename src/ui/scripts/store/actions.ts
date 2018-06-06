import * as Redux from "redux";

export const enum ActionType {
    OPEN_FILE = "OPEN_FILE",
    OPEN_NAV = "OPEN_NAV",

    SET_NAV_LIST = "SET_NAV_LIST",
    SET_PAGE_DATA = "SET_PAGE_DATA",
    SET_PE_PROPS = "SET_PE_PROPS",
    SET_WORKER_ERROR = "SET_WORKER_ERROR",
}

export interface OpenFileAction extends Redux.Action {
    file: File;
}

export function createOpenFileAction(file: File): OpenFileAction {
    return { type: ActionType.OPEN_FILE, file };
}

export interface OpenNavAction extends Redux.Action {
    target: W.NavTarget;
}

export function createOpenNavAction(target: W.NavTarget): OpenNavAction {
    return { type: ActionType.OPEN_NAV, target };
}

export interface SetNavListAction extends Redux.Action {
    navList: W.NavData[];
}

export function createSetNavListAction(navList: W.NavData[]): SetNavListAction {
    return { type: ActionType.SET_NAV_LIST, navList };
}

export interface SetPageDataAction extends Redux.Action {
    data: W.PageData;
}

export function createSetPageDataAction(data: W.PageData): SetPageDataAction {
    return { type: ActionType.SET_PAGE_DATA, data };
}

export interface SetPEPropsAction extends Redux.Action {
    is32Bit?: boolean;
    isManaged?: boolean;
}

export function createSetPEPropsAction(is32Bit?: boolean, isManaged?: boolean): SetPEPropsAction {
    return { type: ActionType.SET_PE_PROPS, is32Bit, isManaged };
}