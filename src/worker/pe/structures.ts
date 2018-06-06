import * as L from "./loader";
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