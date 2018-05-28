declare namespace W {
    //
    // Message
    //

    const enum WorkerMessageType {
        REQ_OPEN_FILE = "REQ_OPEN_FILE",

        RES_NAV_DATA = "RES_NAV_DATA",
        RES_PAGE_DATA = "RES_PAGE_DATA",
        RES_PE_ERROR = "RES_PE_ERROR",
    }

    export interface WorkerMessage {
        type: WorkerMessageType;
    }

    export interface ReqOpenFileMessage extends WorkerMessage {
        file: File;
    }

    export interface ResNavDataMessage extends WorkerMessage {
        navList: NavData[];
    }

    export interface ResPageDataMessage extends WorkerMessage {
        pageData: PageData;
    }

    export interface ResPEErrorMessage extends WorkerMessage {
        error: string;
    }

    //
    // Navigation data
    //

    export interface NavTarget {
        title: string;
        pageID: PageID;
        elemID?: string;
    }

    export interface NavData {
        target: NavTarget;
        children?: NavData[];
    }

    //
    // Page data
    //

    export const enum PageID {
        HOME = "HOME",
        HEADERS = "HEADERS",
    }

    export interface PageData {
        id: PageID;
        title: string;
    }

    export interface SimpleStruct {
        title?: string;
        items?: SimpleStructItem[];
    }

    export interface GroupedStruct {
        title?: string;
        groups?: SimpleStruct[];
    }

    export interface SimpleStructItem {
        offset: string;
        size: string;
        rawData: string[];
        name: string;
        value: string;
        descriptions?: ItemDescription[];
    }

    export const enum ItemDescriptionType {
        SimpleString,
        Nav,
    }

    export interface ItemDescription {
        type: ItemDescriptionType;
    }

    export interface ItemSimpleDescription extends ItemDescription {
        content: string;
    }

    export interface ItemNavDescription extends ItemDescription {
        target: NavTarget;
    }

    export interface HeadersPageData extends PageData {
        dosHeader: SimpleStruct;
        peSignature: SimpleStruct;
        fileHeader: SimpleStruct;
        optionalHeader: GroupedStruct;
        sectionHeaders: GroupedStruct;
    }
}