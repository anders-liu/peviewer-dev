declare namespace W {
    //
    // Message
    //

    const enum WorkerMessageType {
        REQ_OPEN_FILE = "REQ_OPEN_FILE",
        REQ_OPEN_NAV = "REQ_OPEN_NAV",

        RES_NAV_DATA = "RES_NAV_DATA",
        RES_PAGE_DATA = "RES_PAGE_DATA",
        RES_PE_PROPS = "RES_PE_PROPS",
        RES_PE_ERROR = "RES_PE_ERROR",
    }

    export interface WorkerMessage {
        type: WorkerMessageType;
    }

    export interface ReqOpenFileMessage extends WorkerMessage {
        file: File;
    }

    export interface ReqOpenNavMessage extends WorkerMessage {
        target: NavTarget;
    }

    export interface ResNavDataMessage extends WorkerMessage {
        navList: NavData[];
    }

    export interface ResPageDataMessage extends WorkerMessage {
        pageData: PageData;
    }

    export interface ResPEPropsMessage extends WorkerMessage {
        is32Bit?: boolean;
        isManaged?: boolean;
    }

    export interface ResPEErrorMessage extends WorkerMessage {
        error: string;
    }

    //
    // Navigation data
    //

    export interface NavTarget {
        title: KnownTitle;
        pageID: PageID;
        elemID?: KnownElemID | string;
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
        NOTFOUND = "NOTFOUND",
        HEADERS = "HEADERS",
        MD_HEADERS = "MD_HEADERS",
    }

    export const enum KnownElemID {
        DOS_HEADER = "dos-hdr",
        PE_SIGNATURE = "pe-sig",
        FILE_HEADER = "pe-hdr",
        OPTIONAL_HEADER = "opt-hdr",
        DATA_DIRECTORIES = "data-dir",
        SECTION_HEADERS = "sec-hdrs",
        SECTION_HEADER = "sec-hdr",

        CLI_HEADER = "cli-hdr",
        MD_ROOT = "md-root",
        MDS_HEADERS = "md-hdrs",
        SN_SIG = "sn-sig",
    }

    export const enum KnownTitle {
        NOTFOUND = "Page Not Found",
        TOP = "TOP",

        HEADERS = "Headers",
        DOS_HEADER = "DOS Header",
        PE_SIGNATURE = "PE Signature",
        FILE_HEADER = "PE File Header",
        OPTIONAL_HEADER = "Optional Header",
        DATA_DIRECTORIES = "Data Directories",
        SECTION_HEADERS = "Section Headers",

        MD_HEADERS = "Metadata",
        CLI_HEADER = "CLI Header",
        MD_ROOT = "Metadata Root",
        MDS_HEADERS = "Stream Headers",
        SN_SIG = "Strong Name Signature",
    }

    export interface PageData {
        nav: NavTarget;
    }

    export interface StructData {
        title: KnownTitle | string;
        elemID?: KnownElemID | string;
    }

    export interface SimpleStruct extends StructData {
        items?: StructItem[];
    }

    export interface GroupedStruct extends StructData {
        groups?: SimpleStruct[];
    }

    export interface StructItem {
        offset: string;
        size: string;
        rawData: string[];
        name: string;
        value: string;
        descriptions?: ItemDescription[];
    }

    export const enum ItemDescriptionType {
        STR = "STR",
        NAV = "NAV",
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
        dataDirectories: GroupedStruct;
        sectionHeaders: GroupedStruct;
    }

    export interface MetadataHeadersPageData extends PageData {
        cliHeader: SimpleStruct;
        metadataRoot?: SimpleStruct;
        streamHeaders?: GroupedStruct;
        snSignature?: SimpleStruct;
    }
}