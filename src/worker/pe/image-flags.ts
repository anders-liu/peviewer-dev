export const IMAGE_DOS_SIGNATURE = 0x5A4D;  // MZ

export const IMAGE_NT_SIGNATURE = 0x00004550;  // PE00

export const IMAGE_NT_OPTIONAL_HDR32_MAGIC = 0x10b;
export const IMAGE_NT_OPTIONAL_HDR64_MAGIC = 0x20b;

export enum ImageFile {
    IMAGE_FILE_RELOCS_STRIPPED = 0x0001,
    IMAGE_FILE_EXECUTABLE_IMAGE = 0x0002,
    IMAGE_FILE_LINE_NUMS_STRIPPED = 0x0004,
    IMAGE_FILE_LOCAL_SYMS_STRIPPED = 0x0008,
    IMAGE_FILE_AGGRESIVE_WS_TRIM = 0x0010,
    IMAGE_FILE_LARGE_ADDRESS_AWARE = 0x0020,
    IMAGE_FILE_BYTES_REVERSED_LO = 0x0080,
    IMAGE_FILE_32BIT_MACHINE = 0x0100,
    IMAGE_FILE_DEBUG_STRIPPED = 0x0200,
    IMAGE_FILE_REMOVABLE_RUN_FROM_SWAP = 0x0400,
    IMAGE_FILE_NET_RUN_FROM_SWAP = 0x0800,
    IMAGE_FILE_SYSTEM = 0x1000,
    IMAGE_FILE_DLL = 0x2000,
    IMAGE_FILE_UP_SYSTEM_ONLY = 0x4000,
    IMAGE_FILE_BYTES_REVERSED_HI = 0x8000,
}

export enum ImageFileMachine {
    IMAGE_FILE_MACHINE_UNKNOWN = 0,
    IMAGE_FILE_MACHINE_TARGET_HOST = 0x0001,
    IMAGE_FILE_MACHINE_I386 = 0x014c,
    IMAGE_FILE_MACHINE_R3000 = 0x0162,
    IMAGE_FILE_MACHINE_R4000 = 0x0166,
    IMAGE_FILE_MACHINE_R10000 = 0x0168,
    IMAGE_FILE_MACHINE_WCEMIPSV2 = 0x0169,
    IMAGE_FILE_MACHINE_ALPHA = 0x0184,
    IMAGE_FILE_MACHINE_SH3 = 0x01a2,
    IMAGE_FILE_MACHINE_SH3DSP = 0x01a3,
    IMAGE_FILE_MACHINE_SH3E = 0x01a4,
    IMAGE_FILE_MACHINE_SH4 = 0x01a6,
    IMAGE_FILE_MACHINE_SH5 = 0x01a8,
    IMAGE_FILE_MACHINE_ARM = 0x01c0,
    IMAGE_FILE_MACHINE_THUMB = 0x01c2,
    IMAGE_FILE_MACHINE_ARMNT = 0x01c4,
    IMAGE_FILE_MACHINE_AM33 = 0x01d3,
    IMAGE_FILE_MACHINE_POWERPC = 0x01F0,
    IMAGE_FILE_MACHINE_POWERPCFP = 0x01f1,
    IMAGE_FILE_MACHINE_IA64 = 0x0200,
    IMAGE_FILE_MACHINE_MIPS16 = 0x0266,
    IMAGE_FILE_MACHINE_ALPHA64 = 0x0284,
    IMAGE_FILE_MACHINE_MIPSFPU = 0x0366,
    IMAGE_FILE_MACHINE_MIPSFPU16 = 0x0466,
    IMAGE_FILE_MACHINE_AXP64 = IMAGE_FILE_MACHINE_ALPHA64,
    IMAGE_FILE_MACHINE_TRICORE = 0x0520,
    IMAGE_FILE_MACHINE_CEF = 0x0CEF,
    IMAGE_FILE_MACHINE_EBC = 0x0EBC,
    IMAGE_FILE_MACHINE_AMD64 = 0x8664,
    IMAGE_FILE_MACHINE_M32R = 0x9041,
    IMAGE_FILE_MACHINE_ARM64 = 0xAA64,
    IMAGE_FILE_MACHINE_CEE = 0xC0EE,
}

export enum ImageSubsystem {
    IMAGE_SUBSYSTEM_UNKNOWN = 0,
    IMAGE_SUBSYSTEM_NATIVE = 1,
    IMAGE_SUBSYSTEM_WINDOWS_GUI = 2,
    IMAGE_SUBSYSTEM_WINDOWS_CUI = 3,
    IMAGE_SUBSYSTEM_OS2_CUI = 5,
    IMAGE_SUBSYSTEM_POSIX_CUI = 7,
    IMAGE_SUBSYSTEM_NATIVE_WINDOWS = 8,
    IMAGE_SUBSYSTEM_WINDOWS_CE_GUI = 9,
    IMAGE_SUBSYSTEM_EFI_APPLICATION = 10,
    IMAGE_SUBSYSTEM_EFI_BOOT_SERVICE_DRIVER = 11,
    IMAGE_SUBSYSTEM_EFI_RUNTIME_DRIVER = 12,
    IMAGE_SUBSYSTEM_EFI_ROM = 13,
    IMAGE_SUBSYSTEM_XBOX = 14,
    IMAGE_SUBSYSTEM_WINDOWS_BOOT_APPLICATION = 16,
    IMAGE_SUBSYSTEM_XBOX_CODE_CATALOG = 17,
}

export enum ImageDllCharacteristics {
    IMAGE_DLLCHARACTERISTICS_HIGH_ENTROPY_VA = 0x0020,
    IMAGE_DLLCHARACTERISTICS_DYNAMIC_BASE = 0x0040,
    IMAGE_DLLCHARACTERISTICS_FORCE_INTEGRITY = 0x0080,
    IMAGE_DLLCHARACTERISTICS_NX_COMPAT = 0x0100,
    IMAGE_DLLCHARACTERISTICS_NO_ISOLATION = 0x0200,
    IMAGE_DLLCHARACTERISTICS_NO_SEH = 0x0400,
    IMAGE_DLLCHARACTERISTICS_NO_BIND = 0x0800,
    IMAGE_DLLCHARACTERISTICS_APPCONTAINER = 0x1000,
    IMAGE_DLLCHARACTERISTICS_WDM_DRIVER = 0x2000,
    IMAGE_DLLCHARACTERISTICS_GUARD_CF = 0x4000,
    IMAGE_DLLCHARACTERISTICS_TERMINAL_SERVER_AWARE = 0x8000,
}

export enum ImageDirectoryEntry {
    IMAGE_DIRECTORY_ENTRY_EXPORT = 0,
    IMAGE_DIRECTORY_ENTRY_IMPORT = 1,
    IMAGE_DIRECTORY_ENTRY_RESOURCE = 2,
    IMAGE_DIRECTORY_ENTRY_EXCEPTION = 3,
    IMAGE_DIRECTORY_ENTRY_SECURITY = 4,
    IMAGE_DIRECTORY_ENTRY_BASERELOC = 5,
    IMAGE_DIRECTORY_ENTRY_DEBUG = 6,
    IMAGE_DIRECTORY_ENTRY_ARCHITECTURE = 7,
    IMAGE_DIRECTORY_ENTRY_GLOBALPTR = 8,
    IMAGE_DIRECTORY_ENTRY_TLS = 9,
    IMAGE_DIRECTORY_ENTRY_LOAD_CONFIG = 10,
    IMAGE_DIRECTORY_ENTRY_BOUND_IMPORT = 11,
    IMAGE_DIRECTORY_ENTRY_IAT = 12,
    IMAGE_DIRECTORY_ENTRY_DELAY_IMPORT = 13,
    IMAGE_DIRECTORY_ENTRY_COM_DESCRIPTOR = 14,
}

export const IMAGE_NUMBEROF_DIRECTORY_ENTRIES = 16;

export enum ImageSection {
    IMAGE_SCN_TYPE_NO_PAD = 0x00000008,

    IMAGE_SCN_CNT_CODE = 0x00000020,
    IMAGE_SCN_CNT_INITIALIZED_DATA = 0x00000040,
    IMAGE_SCN_CNT_UNINITIALIZED_DATA = 0x00000080,

    IMAGE_SCN_LNK_OTHER = 0x00000100,
    IMAGE_SCN_LNK_INFO = 0x00000200,
    IMAGE_SCN_LNK_REMOVE = 0x00000800,
    IMAGE_SCN_LNK_COMDAT = 0x00001000,

    IMAGE_SCN_NO_DEFER_SPEC_EXC = 0x00004000,
    IMAGE_SCN_GPREL = 0x00008000,

    IMAGE_SCN_MEM_PURGEABLE = 0x00020000,
    IMAGE_SCN_MEM_16BIT = 0x00020000,
    IMAGE_SCN_MEM_LOCKED = 0x00040000,
    IMAGE_SCN_MEM_PRELOAD = 0x00080000,

    IMAGE_SCN_ALIGN_1BYTES = 0x00100000,
    IMAGE_SCN_ALIGN_2BYTES = 0x00200000,
    IMAGE_SCN_ALIGN_4BYTES = 0x00300000,
    IMAGE_SCN_ALIGN_8BYTES = 0x00400000,
    IMAGE_SCN_ALIGN_16BYTES = 0x00500000,
    IMAGE_SCN_ALIGN_32BYTES = 0x00600000,
    IMAGE_SCN_ALIGN_64BYTES = 0x00700000,
    IMAGE_SCN_ALIGN_128BYTES = 0x00800000,
    IMAGE_SCN_ALIGN_256BYTES = 0x00900000,
    IMAGE_SCN_ALIGN_512BYTES = 0x00A00000,
    IMAGE_SCN_ALIGN_1024BYTES = 0x00B00000,
    IMAGE_SCN_ALIGN_2048BYTES = 0x00C00000,
    IMAGE_SCN_ALIGN_4096BYTES = 0x00D00000,
    IMAGE_SCN_ALIGN_8192BYTES = 0x00E00000,

    IMAGE_SCN_LNK_NRELOC_OVFL = 0x01000000,
    IMAGE_SCN_MEM_DISCARDABLE = 0x02000000,
    IMAGE_SCN_MEM_NOT_CACHED = 0x04000000,
    IMAGE_SCN_MEM_NOT_PAGED = 0x08000000,
    IMAGE_SCN_MEM_SHARED = 0x10000000,
    IMAGE_SCN_MEM_EXECUTE = 0x20000000,
    IMAGE_SCN_MEM_READ = 0x40000000,
    IMAGE_SCN_MEM_WRITE = 0x80000000,

    IMAGE_SCN_SCALE_INDEX = 0x00000001,
}

//
// Metadata structures.
//

export enum ComImageFlags {
    COMIMAGE_FLAGS_ILONLY = 0x00000001,
    COMIMAGE_FLAGS_32BITREQUIRED = 0x00000002,
    COMIMAGE_FLAGS_IL_LIBRARY = 0x00000004,
    COMIMAGE_FLAGS_STRONGNAMESIGNED = 0x00000008,
    COMIMAGE_FLAGS_NATIVE_ENTRYPOINT = 0x00000010,
    COMIMAGE_FLAGS_TRACKDEBUGDATA = 0x00010000,
    COMIMAGE_FLAGS_32BITPREFERRED = 0x00020000,
}

export const MetadataSignature = 0x424A5342;

export const enum MetadataStreamName {
    Table = "#~",
    Strings = "#Strings",
    US = "#US",
    GUID = "#GUID",
    Blob = "#Blob",
}

export const enum MetadataHeapSizeID {
    String = 0,
    GUID = 1,
    Blob = 2,
}

export enum MetadataTableIndex {
    Module = 0x00,
    TypeRef = 0x01,
    TypeDef = 0x02,
    FieldPtr = 0x03,
    Field = 0x04,
    MethodPtr = 0x05,
    MethodDef = 0x06,
    ParamPtr = 0x07,
    Param = 0x08,
    InterfaceImpl = 0x09,
    MemberRef = 0x0A,
    Constant = 0x0B,
    CustomAttribute = 0x0C,
    FieldMarshal = 0x0D,
    DeclSecurity = 0x0E,
    ClassLayout = 0x0F,
    FieldLayout = 0x10,
    StandAloneSig = 0x11,
    EventMap = 0x12,
    EventPtr = 0x13,
    Event = 0x14,
    PropertyMap = 0x15,
    PropertyPtr = 0x16,
    Property = 0x17,
    MethodSemantics = 0x18,
    MethodImpl = 0x19,
    ModuleRef = 0x1A,
    TypeSpec = 0x1B,
    ImplMap = 0x1C,
    FieldRVA = 0x1D,
    ENCLog = 0x1E,
    ENCMap = 0x1F,
    Assembly = 0x20,
    AssemblyProcessor = 0x21,
    AssemblyOS = 0x22,
    AssemblyRef = 0x23,
    AssemblyRefProcessor = 0x24,
    AssemblyRefOS = 0x25,
    File = 0x26,
    ExportedType = 0x27,
    ManifestResource = 0x28,
    NestedClass = 0x29,
    GenericParam = 0x2A,
    MethodSpec = 0x2B,
    GenericParamConstraint = 0x2C,

    String = 0x70,
}

export const NumberOfMdTables = 45;

export enum MetadataCodedTokenIndex {
    TypeDefOrRef = 0,
    HasConstant = 1,
    HasCustomAttribute = 2,
    HasFieldMarshall = 3,
    HasDeclSecurity = 4,
    MemberRefParent = 5,
    HasSemantics = 6,
    MethodDefOrRef = 7,
    MemberForwarded = 8,
    Implementation = 9,
    CustomAttributeType = 10,
    ResolutionScope = 11,
    TypeOrMethodDef = 12,
}

export interface MetadataCodedTokenInfo {
    tagSize: number;
    tables: MetadataTableIndex[];
}

export const ctc: MetadataCodedTokenInfo[] = [{
    tagSize: 2, tables: [  // TypeDefOrRef
        MetadataTableIndex.TypeDef,
        MetadataTableIndex.TypeRef,
        MetadataTableIndex.TypeSpec,
    ]
}, {
    tagSize: 2, tables: [  // HasConstant
        MetadataTableIndex.Field,
        MetadataTableIndex.Param,
        MetadataTableIndex.Property,
    ]
}, {
    tagSize: 5, tables: [  // HasCustomAttribute
        MetadataTableIndex.MethodDef,
        MetadataTableIndex.Field,
        MetadataTableIndex.TypeRef,
        MetadataTableIndex.TypeDef,
        MetadataTableIndex.Param,
        MetadataTableIndex.InterfaceImpl,
        MetadataTableIndex.MemberRef,
        MetadataTableIndex.Module,
        MetadataTableIndex.DeclSecurity,
        MetadataTableIndex.Property,
        MetadataTableIndex.Event,
        MetadataTableIndex.StandAloneSig,
        MetadataTableIndex.ModuleRef,
        MetadataTableIndex.TypeSpec,
        MetadataTableIndex.Assembly,
        MetadataTableIndex.AssemblyRef,
        MetadataTableIndex.File,
        MetadataTableIndex.ExportedType,
        MetadataTableIndex.ManifestResource,
        MetadataTableIndex.GenericParam,
        MetadataTableIndex.GenericParamConstraint,
        MetadataTableIndex.MethodSpec,
    ]
}, {
    tagSize: 1, tables: [  // HasFieldMarshall
        MetadataTableIndex.Field,
        MetadataTableIndex.Param,
    ]
}, {
    tagSize: 2, tables: [  // HasDeclSecurity
        MetadataTableIndex.TypeDef,
        MetadataTableIndex.MethodDef,
        MetadataTableIndex.Assembly,
    ]
}, {
    tagSize: 3, tables: [  // MemberRefParent
        MetadataTableIndex.TypeDef,
        MetadataTableIndex.TypeRef,
        MetadataTableIndex.ModuleRef,
        MetadataTableIndex.MethodDef,
        MetadataTableIndex.TypeSpec,
    ]
}, {
    tagSize: 1, tables: [  // HasSemantics
        MetadataTableIndex.Event,
        MetadataTableIndex.Property,
    ]
}, {
    tagSize: 1, tables: [  // MethodDefOrRef
        MetadataTableIndex.MethodDef,
        MetadataTableIndex.MemberRef,
    ]
}, {
    tagSize: 1, tables: [  // MemberForwarded
        MetadataTableIndex.Field,
        MetadataTableIndex.MethodDef,
    ]
}, {
    tagSize: 2, tables: [  // Implementation
        MetadataTableIndex.File,
        MetadataTableIndex.AssemblyRef,
        MetadataTableIndex.ExportedType,
    ]
}, {
    tagSize: 3, tables: [  // CustomAttributeType
        MetadataTableIndex.TypeRef,
        MetadataTableIndex.TypeDef,
        MetadataTableIndex.MethodDef,
        MetadataTableIndex.MemberRef,
        MetadataTableIndex.String,
    ]
}, {
    tagSize: 2, tables: [  // ResolutionScope
        MetadataTableIndex.Module,
        MetadataTableIndex.ModuleRef,
        MetadataTableIndex.AssemblyRef,
        MetadataTableIndex.TypeRef,
    ]
}, {
    tagSize: 1, tables: [  // TypeOrMethodDef
        MetadataTableIndex.TypeDef,
        MetadataTableIndex.MethodDef,
    ]
}];
