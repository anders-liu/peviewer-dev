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
        title: KnownTitle | string;
        pageID: PageID;
        pageNum?: number; // 0-based
        elemID?: KnownElemID | string;
    }

    export interface NavData {
        target: NavTarget;
        children?: NavData[];
    }

    //
    // Paging
    //
    export interface Paging {
        currentPageNumber: number;
        pageNavList: NavTarget[];
    }

    //
    // Page data
    //

    export const enum PageID {
        HOME = "HOME",
        NOTFOUND = "NOTFOUND",
        HEADERS = "HEADERS",
        MD_HEADERS = "MD_HEADERS",
        MDS_TABLE = "MDS_TABLE",
        MDS_STRINGS = "MDS_STRINGS",
        MDS_US = "MDS_US",
        MDS_GUID = "MDS_GUID",
        MDS_BLOB = "MDS_BLOB",
        MDT_MODULE = "MDT_MODULE",
        MDT_TYPEREF = "MDT_TYPEREF",
        MDT_TYPEDEF = "MDT_TYPEDEF",
        MDT_FIELDPTR = "MDT_FIELDPTR",
        MDT_FIELD = "MDT_FIELD",
        MDT_METHODPTR = "MDT_METHODPTR",
        MDT_METHODDEF = "MDT_METHODDEF",
        MDT_PARAMPTR = "MDT_PARAMPTR",
        MDT_PARAM = "MDT_PARAM",
        MDT_INTERFACEIMPL = "MDT_INTERFACEIMPL",
        MDT_MEMBERREF = "MDT_MEMBERREF",
        MDT_CONSTANT = "MDT_CONSTANT",
        MDT_CUSTOMATTRIBUTE = "MDT_CUSTOMATTRIBUTE",
        MDT_FIELDMARSHAL = "MDT_FIELDMARSHAL",
        MDT_DECLSECURITY = "MDT_DECLSECURITY",
        MDT_CLASSLAYOUT = "MDT_CLASSLAYOUT",
        MDT_FIELDLAYOUT = "MDT_FIELDLAYOUT",
        MDT_STANDALONESIG = "MDT_STANDALONESIG",
        MDT_EVENTMAP = "MDT_EVENTMAP",
        MDT_EVENTPTR = "MDT_EVENTPTR",
        MDT_EVENT = "MDT_EVENT",
        MDT_PROPERTYMAP = "MDT_PROPERTYMAP",
        MDT_PROPERTYPTR = "MDT_PROPERTYPTR",
        MDT_PROPERTY = "MDT_PROPERTY",
        MDT_METHODSEMANTICS = "MDT_METHODSEMANTICS",
        MDT_METHODIMPL = "MDT_METHODIMPL",
        MDT_MODULEREF = "MDT_MODULEREF",
        MDT_TYPESPEC = "MDT_TYPESPEC",
        MDT_IMPLMAP = "MDT_IMPLMAP",
        MDT_FIELDRVA = "MDT_FIELDRVA",
        MDT_ENCLOG = "MDT_ENCLOG",
        MDT_ENCMAP = "MDT_ENCMAP",
        MDT_ASSEMBLY = "MDT_ASSEMBLY",
        MDT_ASSEMBLYPROCESSOR = "MDT_ASSEMBLYPROCESSOR",
        MDT_ASSEMBLYOS = "MDT_ASSEMBLYOS",
        MDT_ASSEMBLYREF = "MDT_ASSEMBLYREF",
        MDT_ASSEMBLYREFPROCESSOR = "MDT_ASSEMBLYREFPROCESSOR",
        MDT_ASSEMBLYREFOS = "MDT_ASSEMBLYREFOS",
        MDT_FILE = "MDT_FILE",
        MDT_EXPORTEDTYPE = "MDT_EXPORTEDTYPE",
        MDT_MANIFESTRESOURCE = "MDT_MANIFESTRESOURCE",
        MDT_NESTEDCLASS = "MDT_NESTEDCLASS",
        MDT_GENERICPARAM = "MDT_GENERICPARAM",
        MDT_METHODSPEC = "MDT_METHODSPEC",
        MDT_GENERICPARAMCONSTRAINT = "MDT_GENERICPARAMCONSTRAINT",
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

        MDT_HEADER = "mdt-hdr",
        MDT_LIST = "mdt-lst",
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

        MDS_TABLE = "#~ Stream",
        MDT_HEADER = "Metadata Table Header",
        MDT_LIST = "Metadata Table List",

        MDS_STRINGS = "#String Stream",
        MDS_US = "#US",
        MDS_GUID = "#GUID",
        MDS_BLOB = "#Blob",

        MDT_MODULE = "Module Table",
        MDT_TYPEREF = "TypeRef Table",
        MDT_TYPEDEF = "TypeDef Table",
        MDT_FIELDPTR = "FieldPtr Table",
        MDT_FIELD = "Field Table",
        MDT_METHODPTR = "MethodPtr Table",
        MDT_METHODDEF = "MethodDef Table",
        MDT_PARAMPTR = "ParamPtr Table",
        MDT_PARAM = "Param Table",
        MDT_INTERFACEIMPL = "InterfaceImpl Table",
        MDT_MEMBERREF = "MemberRef Table",
        MDT_CONSTANT = "Constant Table",
        MDT_CUSTOMATTRIBUTE = "CustomAttribute Table",
        MDT_FIELDMARSHAL = "FieldMarshal Table",
        MDT_DECLSECURITY = "DeclSecurity Table",
        MDT_CLASSLAYOUT = "ClassLayout Table",
        MDT_FIELDLAYOUT = "FieldLayout Table",
        MDT_STANDALONESIG = "StandAloneSig Table",
        MDT_EVENTMAP = "EventMap Table",
        MDT_EVENTPTR = "EventPtr Table",
        MDT_EVENT = "Event Table",
        MDT_PROPERTYMAP = "PropertyMap Table",
        MDT_PROPERTYPTR = "PropertyPtr Table",
        MDT_PROPERTY = "Property Table",
        MDT_METHODSEMANTICS = "MethodSemantics Table",
        MDT_METHODIMPL = "MethodImpl Table",
        MDT_MODULEREF = "ModuleRef Table",
        MDT_TYPESPEC = "TypeSpec Table",
        MDT_IMPLMAP = "ImplMap Table",
        MDT_FIELDRVA = "FieldRVA Table",
        MDT_ENCLOG = "ENCLog Table",
        MDT_ENCMAP = "ENCMap Table",
        MDT_ASSEMBLY = "Assembly Table",
        MDT_ASSEMBLYPROCESSOR = "AssemblyProcessor Table",
        MDT_ASSEMBLYOS = "AssemblyOS Table",
        MDT_ASSEMBLYREF = "AssemblyRef Table",
        MDT_ASSEMBLYREFPROCESSOR = "AssemblyRefProcessor Table",
        MDT_ASSEMBLYREFOS = "AssemblyRefOS Table",
        MDT_FILE = "File Table",
        MDT_EXPORTEDTYPE = "ExportedType Table",
        MDT_MANIFESTRESOURCE = "ManifestResource Table",
        MDT_NESTEDCLASS = "NestedClass Table",
        MDT_GENERICPARAM = "GenericParam Table",
        MDT_METHODSPEC = "MethodSpec Table",
        MDT_GENERICPARAMCONSTRAINT = "GenericParamConstraint Table",
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

    export interface MdsTablePageData extends PageData {
        tableHeader: GroupedStruct;
        tableInfo: MdTableInfo[];
    }

    export interface MdTableInfo {
        index: string;
        name: string;
        valid: boolean;
        sorted: boolean;
        rows: string;
    }

    export interface PagedItemListPageData extends PageData {
        items: GroupedStruct;
        paging?: Paging;
    }
}