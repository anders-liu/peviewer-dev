/// <reference path="../../../worker/worker.d.ts" />

export interface AppState {
    appInfo: AppInfo;
    fileInfo: FileInfo | null;
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
