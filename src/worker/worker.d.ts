declare namespace W {
    //
    // Message
    //

    type WorkerMessageType
        = "REQ_OPEN_FILE"

        | "RES_NAV_DATA"
        | "RES_PAGE_DATA"
        | "RES_PE_ERROR"
        ;

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

    export type PageID
        = "HOME"
        | "HEADERS"
        ;

    export interface PageData {
        id: PageID;
        title: string;
    }

    export interface SimpleStruct {
        title?: string;
        items: SimpleStructItem[];
    }

    export interface GroupedStruct {
        title?: string;
        groups: GroupedStructData[];
    }

    export interface GroupedStructData {
        title?: string;
        items: SimpleStructItem[];
    }

    export interface SimpleStructItem {
        offset: number;
        rva?: number;
        size: number;
        name: string;
        value: number;
    }

    export interface HeadersPageData extends PageData {
        dosHeader: SimpleStruct;
        peSignature: SimpleStruct;
        peHeader: SimpleStruct;
        optionalHeader: GroupedStruct;
        sectionHeaders: SimpleStruct[];
    }
}