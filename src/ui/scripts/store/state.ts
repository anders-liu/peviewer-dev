/// <reference path="../../../worker/worker.d.ts" />

export interface AppState {
    appInfo: AppInfo;
    fileInfo?: FileInfo;
    pageData?: W.PageData;
    navList?: W.NavData[];
}

export interface AppInfo {
    title: string;
    version: string;
    author: string;
    homepage: string;
    bugsUrl: string;
    buildTimeLocal: string;
    year: string;
}

export interface FileInfo {
    name: string;
    size: number;
    is32Bit?: boolean;
    isManaged?: boolean;
}
