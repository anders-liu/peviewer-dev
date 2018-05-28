/// <reference path="../../../worker/worker.d.ts" />

export interface AppState {
    appInfo: AppInfo;
    fileInfo?: FileInfo;
    pageData?: W.PageData;
}

export interface AppInfo {
    title: string;
    version: string;
    author: string;
    homepage: string;
    bugsUrl: string;
    year: string;
}

export interface FileInfo {
    name: string;
    size: number;
}
