import * as F from "./image-flags";

//
// Basic structures.
//

export interface FileData {
    _offset: number;
    _size: number;
}

export interface Field extends FileData {
    data: Uint8Array;
}

export interface UIntField extends Field {
    value: number;
}

export interface U1Field extends UIntField { }
export interface U2Field extends UIntField { }
export interface U4Field extends UIntField { }

export interface U8Field extends Field {
    high: number;
    low: number;
}

export interface CompressedUIntField extends UIntField { }

export interface EnumField<T> extends Field {
    value: T;
}

export interface U1EnumField<T> extends EnumField<T> { }
export interface U2EnumField<T> extends EnumField<T> { }
export interface U4EnumField<T> extends EnumField<T> { }

export interface StringField extends Field {
    value: string;
}

export interface StructArray<T extends FileData> extends FileData {
    items: T[];
}

//
// Image headers.
//

export interface ImageDosHeader extends FileData {
    /* WORD     */ e_magic: U2Field;
    /* WORD     */ e_cblp: U2Field;
    /* WORD     */ e_cp: U2Field;
    /* WORD     */ e_crlc: U2Field;
    /* WORD     */ e_cparhdr: U2Field;
    /* WORD     */ e_minalloc: U2Field;
    /* WORD     */ e_maxalloc: U2Field;
    /* WORD     */ e_ss: U2Field;
    /* WORD     */ e_sp: U2Field;
    /* WORD     */ e_csum: U2Field;
    /* WORD     */ e_ip: U2Field;
    /* WORD     */ e_cs: U2Field;
    /* WORD     */ e_lfarlc: U2Field;
    /* WORD     */ e_ovno: U2Field;
    /* WORD[4]  */ e_res: Field;
    /* WORD     */ e_oemid: U2Field;
    /* WORD     */ e_oeminfo: U2Field;
    /* WORD[10] */ e_res2: Field;
    /* LONG     */ e_lfanew: U4Field;
};

export interface ImageFileHeader extends FileData {
    /* WORD  */ Machine: U2EnumField<F.ImageFileMachine>;
    /* WORD  */ NumberOfSections: U2Field;
    /* DWORD */ TimeDateStamp: U4Field;
    /* DWORD */ PointerToSymbolTable: U4Field;
    /* DWORD */ NumberOfSymbols: U4Field;
    /* WORD  */ SizeOfOptionalHeader: U2Field;
    /* WORD  */ Characteristics: U2EnumField<F.ImageFile>;
};

export interface ImageOptionalHeader32 extends FileData {
    /* WORD  */ Magic: U2Field;
    /* BYTE  */ MajorLinkerVersion: U1Field;
    /* BYTE  */ MinorLinkerVersion: U1Field;
    /* DWORD */ SizeOfCode: U4Field;
    /* DWORD */ SizeOfInitializedData: U4Field;
    /* DWORD */ SizeOfUninitializedData: U4Field;
    /* DWORD */ AddressOfEntryPoint: U4Field;
    /* DWORD */ BaseOfCode: U4Field;
    /* DWORD */ BaseOfData: U4Field;

    /* DWORD */ ImageBase: U4Field;
    /* DWORD */ SectionAlignment: U4Field;
    /* DWORD */ FileAlignment: U4Field;
    /* WORD  */ MajorOperatingSystemVersion: U2Field;
    /* WORD  */ MinorOperatingSystemVersion: U2Field;
    /* WORD  */ MajorImageVersion: U2Field;
    /* WORD  */ MinorImageVersion: U2Field;
    /* WORD  */ MajorSubsystemVersion: U2Field;
    /* WORD  */ MinorSubsystemVersion: U2Field;
    /* DWORD */ Win32VersionValue: U4Field;
    /* DWORD */ SizeOfImage: U4Field;
    /* DWORD */ SizeOfHeaders: U4Field;
    /* DWORD */ CheckSum: U4Field;
    /* WORD  */ Subsystem: U2EnumField<F.ImageSubsystem>;
    /* WORD  */ DllCharacteristics: U2EnumField<F.ImageDllCharacteristics>;
    /* DWORD */ SizeOfStackReserve: U4Field;
    /* DWORD */ SizeOfStackCommit: U4Field;
    /* DWORD */ SizeOfHeapReserve: U4Field;
    /* DWORD */ SizeOfHeapCommit: U4Field;
    /* DWORD */ LoaderFlags: U4Field;
    /* DWORD */ NumberOfRvaAndSizes: U4Field;
};

export interface ImageOptionalHeader64 extends FileData {
    /* WORD  */ Magic: U2Field;
    /* BYTE  */ MajorLinkerVersion: U1Field;
    /* BYTE  */ MinorLinkerVersion: U1Field;
    /* DWORD */ SizeOfCode: U4Field;
    /* DWORD */ SizeOfInitializedData: U4Field;
    /* DWORD */ SizeOfUninitializedData: U4Field;
    /* DWORD */ AddressOfEntryPoint: U4Field;
    /* DWORD */ BaseOfCode: U4Field;

    /* ULONGLONG */ ImageBase: U8Field;
    /* DWORD */ SectionAlignment: U4Field;
    /* DWORD */ FileAlignment: U4Field;
    /* WORD  */ MajorOperatingSystemVersion: U2Field;
    /* WORD  */ MinorOperatingSystemVersion: U2Field;
    /* WORD  */ MajorImageVersion: U2Field;
    /* WORD  */ MinorImageVersion: U2Field;
    /* WORD  */ MajorSubsystemVersion: U2Field;
    /* WORD  */ MinorSubsystemVersion: U2Field;
    /* DWORD */ Win32VersionValue: U4Field;
    /* DWORD */ SizeOfImage: U4Field;
    /* DWORD */ SizeOfHeaders: U4Field;
    /* DWORD */ CheckSum: U4Field;
    /* WORD  */ Subsystem: U2EnumField<F.ImageSubsystem>;
    /* WORD  */ DllCharacteristics: U2EnumField<F.ImageDllCharacteristics>;
    /* ULONGLONG */ SizeOfStackReserve: U8Field;
    /* ULONGLONG */ SizeOfStackCommit: U8Field;
    /* ULONGLONG */ SizeOfHeapReserve: U8Field;
    /* ULONGLONG */ SizeOfHeapCommit: U8Field;
    /* DWORD */ LoaderFlags: U4Field;
    /* DWORD */ NumberOfRvaAndSizes: U4Field;
};

export interface ImageDataDirectory extends FileData {
    /* DWORD */ VirtualAddress: U4Field;
    /* DWORD */ Size: U4Field;
};

export interface ImageSectionHeader extends FileData {
    /* BYTE[IMAGE_SIZEOF_SHORT_NAME] */ Name: StringField;
    /* DWORD */ VirtualSize: U4Field;
    /* DWORD */ VirtualAddress: U4Field;
    /* DWORD */ SizeOfRawData: U4Field;
    /* DWORD */ PointerToRawData: U4Field;
    /* DWORD */ PointerToRelocations: U4Field;
    /* DWORD */ PointerToLinenumbers: U4Field;
    /* WORD  */ NumberOfRelocations: U2Field;
    /* WORD  */ NumberOfLinenumbers: U2Field;
    /* DWORD */ Characteristics: U4EnumField<F.ImageSection>;
};

//
// Metadata structures.
//

export interface CliHeader extends FileData {
    /* DWORD                */ cb: U4Field;
    /* WORD                 */ MajorRuntimeVersion: U2Field;
    /* WORD                 */ MinorRuntimeVersion: U2Field;
    /* IMAGE_DATA_DIRECTORY */ MetaData: ImageDataDirectory;
    /* DWORD                */ Flags: U4EnumField<F.ComImageFlags>;
    /* DWORD                */ EntryPointToken: U4Field;
    /* IMAGE_DATA_DIRECTORY */ Resources: ImageDataDirectory;
    /* IMAGE_DATA_DIRECTORY */ StrongNameSignature: ImageDataDirectory;
    /* IMAGE_DATA_DIRECTORY */ CodeManagerTable: ImageDataDirectory;
    /* IMAGE_DATA_DIRECTORY */ VTableFixups: ImageDataDirectory;
    /* IMAGE_DATA_DIRECTORY */ ExportAddressTableJumps: ImageDataDirectory;
    /* IMAGE_DATA_DIRECTORY */ ManagedNativeHeader: ImageDataDirectory;
}

export interface MetadataRoot extends FileData {
    Signature: U4Field;
    MajorVersion: U2Field;
    MinorVersion: U2Field;
    Reserved: U4Field;
    VersionLength: U4Field;
    VersionString: StringField;
    VersionPadding: Field;
    Flags: U2Field;  // Reserved, always 0
    Streams: U2Field;
}

export interface MetadataStreamHeader extends FileData {
    Offset: U4Field;
    Size: U4Field;
    Name: StringField;
    Padding: Field;
}

export interface MetadataTableHeader extends FileData {
    Reserved: U4Field;
    MajorVersion: U1Field;
    MinorVersion: U1Field;
    HeapSizes: U1Field;
    Reserved2: U1Field;
    Valid: U8Field;
    Sorted: U8Field;
    Rows: StructArray<U4Field>;
}

export interface MetadataUSItem extends FileData {
    Size: CompressedUIntField;
    Value: StringField;
    Suffix: Field;
}

export interface MetadataBlobItem extends FileData {
    Size: CompressedUIntField;
    Value: Field;
}

export interface MdtRidField extends UIntField { }
export interface MdsStringsField extends UIntField { }
export interface MdsGuidField extends UIntField { }
export interface MdsBlobField extends UIntField { }
export interface MdCodedTokenField extends UIntField {
    tid: F.MetadataTableIndex;
    rid: number;
}
export interface MdTokenField extends UIntField {
    tid: F.MetadataTableIndex;
    rid: number;
}

export interface MdtModuleItem extends FileData {
    Generation: U2Field;
    Name: MdsStringsField;
    Mvid: MdsGuidField;
    EncId: MdsGuidField;
    EncBaseId: MdsGuidField;
}

export interface MdtTypeRefItem extends FileData {
    ResolutionScope: MdCodedTokenField;  // ResolutionScope
    Name: MdsStringsField;
    Namespace: MdsStringsField;
}

export interface MdtTypeDefItem extends FileData {
    Flags: U4EnumField<F.CorTypeAttr>;
    Name: MdsStringsField;
    Namespace: MdsStringsField;
    Extends: MdCodedTokenField;  // TypeDefOrRef
    FieldList: MdtRidField;  // Field
    MethodList: MdtRidField;  // MethodDef
}

export interface MdtFieldPtrItem extends FileData {
    Field: MdtRidField;
}

export interface MdtFieldItem extends FileData {
    Flags: U2EnumField<F.CorFieldAttr>;
    Name: MdsStringsField;
    Signature: MdsBlobField;
}

export interface MdtMethodPtrItem extends FileData {
    Method: MdtRidField;
}

export interface MdtMethodDefItem extends FileData {
    RVA: U4Field;
    ImplFlags: U2EnumField<F.CorMethodImpl>;
    Flags: U2EnumField<F.CorMethodAttr>;
    Name: MdsStringsField;
    Signature: MdsBlobField;
    ParamList: MdtRidField;  // Param
}

export interface MdtParamPtrItem extends FileData {
    Param: MdtRidField;
}

export interface MdtParamItem extends FileData {
    Flags: U2EnumField<F.CorParamAttr>;
    Sequence: U2Field;
    Name: MdsStringsField;
}

export interface MdtInterfaceImplItem extends FileData {
    Class: MdtRidField;  // TypeDef
    Interface: MdCodedTokenField;  // TypeDefOrRef
}

export interface MdtMemberRefItem extends FileData {
    Class: MdCodedTokenField;  // MemberRefParent
    Name: MdsStringsField;
    Signature: MdsBlobField;
}

export interface MdtConstantItem extends FileData {
    Type: U1EnumField<F.CorElementType>;
    PaddingZero: U1Field;
    Parent: MdCodedTokenField;  // HasConstant
    Value: MdsBlobField;
}

export interface MdtCustomAttributeItem extends FileData {
    Parent: MdCodedTokenField;  // HasCustomAttribute
    Type: MdCodedTokenField;  // CustomAttributeType
    Value: MdsBlobField;
}

export interface MdtFieldMarshalItem extends FileData {
    Parent: MdCodedTokenField;  // HasFieldMarshal
    NativeType: MdsBlobField;
}

export interface MdtDeclSecurityItem extends FileData {
    Action: U2EnumField<F.CorDeclSecurity>;
    Parent: MdCodedTokenField;  // HasDeclSecurity
    PermissionSet: MdsBlobField;
}

export interface MdtClassLayoutItem extends FileData {
    PackingSize: U2Field;
    ClassSize: U4Field;
    Parent: MdtRidField;  // TypeDef
}

export interface MdtFieldLayoutItem extends FileData {
    OffSet: U4Field;
    Field: MdtRidField;  // Field
}

export interface MdtStandAloneSigItem extends FileData {
    Signature: MdsBlobField;
}

export interface MdtEventMapItem extends FileData {
    Parent: MdtRidField;  // TypeDef
    EventList: MdtRidField;  // Event
}

export interface MdtEventPtrItem extends FileData {
    Event: MdtRidField;
}

export interface MdtEventItem extends FileData {
    EventFlags: U2EnumField<F.CorEventAttr>;
    Name: MdsStringsField;
    EventType: MdCodedTokenField;  // TypeDefOrRef
}

export interface MdtPropertyMapItem extends FileData {
    Parent: MdtRidField;  // TypeDef
    PropertyList: MdtRidField;  // Property
}

export interface MdtPropertyPtrItem extends FileData {
    Property: MdtRidField;
}

export interface MdtPropertyItem extends FileData {
    PropFlags: U2EnumField<F.CorPropertyAttr>;
    Name: MdsStringsField;
    Type: MdsBlobField;
}

export interface MdtMethodSemanticsItem extends FileData {
    Semantic: U2EnumField<F.CorMethodSemanticsAttr>;
    Method: MdtRidField;  // MethodDef
    Association: MdCodedTokenField;  // HasSemantics
}

export interface MdtMethodImplItem extends FileData {
    Class: MdtRidField;  // TypeDef
    MethodBody: MdCodedTokenField;  // MethodDefOrRef
    MethodDeclaration: MdCodedTokenField;  // MethodDefOrRef
}

export interface MdtModuleRefItem extends FileData {
    Name: MdsStringsField;
}

export interface MdtTypeSpecItem extends FileData {
    Signature: MdsBlobField;
}

export interface MdtImplMapItem extends FileData {
    MappingFlags: U2EnumField<F.CorPinvokeMap>;
    MemberForwarded: MdCodedTokenField;  // MemberForwarded
    ImportName: MdsStringsField;
    ImportScope: MdtRidField;  // ModuleRef
}

export interface MdtFieldRVAItem extends FileData {
    RVA: U4Field;
    Field: MdtRidField;  // Field
}

export interface MdtENCLogItem extends FileData {
    Token: U4Field;
    FuncCode: U4Field;
}

export interface MdtENCMapItem extends FileData {
    Token: U4Field;
}

export interface MdtAssemblyItem extends FileData {
    HashAlgId: U4EnumField<F.AssemblyHashAlgorithm>;
    MajorVersion: U2Field;
    MinorVersion: U2Field;
    BuildNumber: U2Field;
    RevisionNumber: U2Field;
    Flags: U4EnumField<F.CorAssemblyFlags>;
    PublicKey: MdsBlobField;
    Name: MdsStringsField;
    Locale: MdsStringsField;
}

export interface MdtAssemblyProcessorItem extends FileData {
    Processor: U4Field;
}

export interface MdtAssemblyOSItem extends FileData {
    OSPlatformID: U4Field;
    OSMajorVersion: U4Field;
    OSMinorVersion: U4Field;
}

export interface MdtAssemblyRefItem extends FileData {
    MajorVersion: U2Field;
    MinorVersion: U2Field;
    BuildNumber: U2Field;
    RevisionNumber: U2Field;
    Flags: U4EnumField<F.CorAssemblyFlags>;
    PublicKeyOrToken: MdsBlobField;
    Name: MdsStringsField;
    Locale: MdsStringsField;
    HashValue: MdsBlobField;
}

export interface MdtAssemblyRefProcessorItem extends FileData {
    Processor: U4Field;
    AssemblyRef: MdtRidField;
}

export interface MdtAssemblyRefOSItem extends FileData {
    OSPlatformID: U4Field;
    OSMajorVersion: U4Field;
    OSMinorVersion: U4Field;
    AssemblyRef: MdtRidField;
}

export interface MdtFileItem extends FileData {
    Flags: U4EnumField<F.CorFileFlags>;
    Name: MdsStringsField;
    HashValue: MdsBlobField;
}

export interface MdtExportedTypeItem extends FileData {
    Flags: U4EnumField<F.CorTypeAttr>;
    TypeDefId: U4Field;
    TypeName: MdsStringsField;
    TypeNamespace: MdsStringsField;
    Implementation: MdCodedTokenField;  // Implementation
}

export interface MdtManifestResourceItem extends FileData {
    Offset: U4Field;
    Flags: U4EnumField<F.CorManifestResourceFlags>;
    Name: MdsStringsField;
    Implementation: MdCodedTokenField;  // Implementation
}

export interface MdtNestedClassItem extends FileData {
    NestedClass: MdtRidField;  // TypeDef
    EnclosingClass: MdtRidField;  // TypeDef
}

export interface MdtGenericParamItem extends FileData {
    Number: U2Field;
    Flags: U2EnumField<F.CorGenericParamAttr>;
    Owner: MdCodedTokenField;  // TypeOrMethodDef
    Name: MdsStringsField;
}

export interface MdtMethodSpecItem extends FileData {
    Method: MdCodedTokenField;  // MethodDefOrRef
    Instantiation: MdsBlobField;
}

export interface MdtGenericParamConstraintItem extends FileData {
    Owner: MdtRidField;  // GenericParam
    Constraint: MdCodedTokenField;  // TypeDefOrRef
}