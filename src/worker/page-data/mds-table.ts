import { PEImage } from "../pe/image";
import * as F from "../pe/image-flags";
import * as S from "../pe/structures";
import * as FM from "./formatter";
import * as G from "./generator";

export function generateMdsTablePageData(pe: PEImage): W.MdsTablePageData {
    return {
        nav: {
            pageID: W.PageID.MDS_TABLE,
            title: W.KnownTitle.MDS_TABLE,
        },
        tableHeader: generateMDTableHeader(pe),
        tableInfo: generateMDTableList(pe),
    };
}

function generateMDTableHeader(pe: PEImage): W.GroupedStruct {
    let s: W.GroupedStruct = {
        title: W.KnownTitle.MDT_HEADER,
        elemID: W.KnownElemID.MDT_HEADER,
    };

    const h = pe.getMetadataTableHeader();
    if (!h) return s;

    s.groups = [{
        title: "",
        items: [
            FM.formatU4Field("Reserved", h.Reserved),
            FM.formatU1Field("MajorVersion", h.MajorVersion, true),
            FM.formatU1Field("MinorVersion", h.MinorVersion, true),
            FM.formatU1Field("HeapSizes", h.HeapSizes),
            FM.formatU1Field("Reserved2", h.Reserved2),
            FM.formatU8Field("Valid", h.Valid),
            FM.formatU8Field("Sorted", h.Sorted),
        ]
    }, {
        title: "Rows",
        items: h.Rows.items.map((v, i) => FM.formatU4Field(`Rows[${i}]`, v, true))
    }];

    return s;
}

function generateMDTableList(pe: PEImage): W.MdTableInfo[] {
    let s: W.MdTableInfo[] = [];
    for (let id = 0; id < F.NumberOfMdTables; id++) {
        s.push({
            index: `${FM.formatU1Hex(id)} (${FM.formatDec(id)})`,
            name: F.MetadataTableIndex[id],
            valid: pe.isMetadataTableValid(id),
            sorted: pe.isMetadataTableSorted(id),
            rows: FM.formatDec(pe.getMetadataTableRows(id)),
        });
    }
    return s;
}

export function generateMdtPageData(
    pe: PEImage,
    tid: F.MetadataTableIndex,
    cfg: G.GeneratorConfig,
    pgNum: number): W.PagedItemListPageData {
    const ti = F.MetadataTableIndex;
    const title = ti[tid] + " Table";

    return {
        nav: {
            pageID: W.PageID.MDT_TBL,
            subID: ti[tid],
            title,
        },
        items: generateTalbeItems(pe, tid, cfg, pgNum, title),
        paging: generateMdtPaging(pe, tid, cfg, pgNum)
    };
}

function generateTalbeItems(
    pe: PEImage,
    tid: F.MetadataTableIndex,
    cfg: G.GeneratorConfig,
    pgNum: number,
    title: string): W.GroupedStruct {
    const { start, end } = getRidOnPage(pe, tid, cfg, pgNum);

    let loader: (rid: number) => S.FileData;
    let builder: (item: S.FileData) => W.StructItem[];

    switch (tid) {
        case F.MetadataTableIndex.Module:
            loader = pe.getMdtModuleItem.bind(pe);
            builder = generateMdtModuleItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.TypeRef:
            loader = pe.getMdtTypeRefItem.bind(pe);
            builder = generateMdtTypeRefItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.TypeDef:
            loader = pe.getMdtTypeDefItem.bind(pe);
            builder = generateMdtTypeDefItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.FieldPtr:
            loader = pe.getMdtFieldPtrItem.bind(pe);
            builder = generateMdtFieldPtrItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.Field:
            loader = pe.getMdtFieldItem.bind(pe);
            builder = generateMdtFieldItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.MethodPtr:
            loader = pe.getMdtMethodPtrItem.bind(pe);
            builder = generateMdtMethodPtrItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.MethodDef:
            loader = pe.getMdtMethodDefItem.bind(pe);
            builder = generateMdtMethodDefItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.ParamPtr:
            loader = pe.getMdtParamPtrItem.bind(pe);
            builder = generateMdtParamPtrItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.Param:
            loader = pe.getMdtParamItem.bind(pe);
            builder = generateMdtParamItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.InterfaceImpl:
            loader = pe.getMdtInterfaceImplItem.bind(pe);
            builder = generateMdtInterfaceImplItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.MemberRef:
            loader = pe.getMdtMemberRefItem.bind(pe);
            builder = generateMdtMemberRefItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.Constant:
            loader = pe.getMdtConstantItem.bind(pe);
            builder = generateMdtConstantItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.CustomAttribute:
            loader = pe.getMdtCustomAttributeItem.bind(pe);
            builder = generateMdtCustomAttributeItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.FieldMarshal:
            loader = pe.getMdtFieldMarshalItem.bind(pe);
            builder = generateMdtFieldMarshalItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.DeclSecurity:
            loader = pe.getMdtDeclSecurityItem.bind(pe);
            builder = generateMdtDeclSecurityItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.ClassLayout:
            loader = pe.getMdtClassLayoutItem.bind(pe);
            builder = generateMdtClassLayoutItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.FieldLayout:
            loader = pe.getMdtFieldLayoutItem.bind(pe);
            builder = generateMdtFieldLayoutItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.StandAloneSig:
            loader = pe.getMdtStandAloneSigItem.bind(pe);
            builder = generateMdtStandAloneSigItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.EventMap:
            loader = pe.getMdtEventMapItem.bind(pe);
            builder = generateMdtEventMapItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.EventPtr:
            loader = pe.getMdtEventPtrItem.bind(pe);
            builder = generateMdtEventPtrItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.Event:
            loader = pe.getMdtEventItem.bind(pe);
            builder = generateMdtEventItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.PropertyMap:
            loader = pe.getMdtPropertyMapItem.bind(pe);
            builder = generateMdtPropertyMapItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.PropertyPtr:
            loader = pe.getMdtPropertyPtrItem.bind(pe);
            builder = generateMdtPropertyPtrItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.Property:
            loader = pe.getMdtPropertyItem.bind(pe);
            builder = generateMdtPropertyItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.MethodSemantics:
            loader = pe.getMdtMethodSemanticsItem.bind(pe);
            builder = generateMdtMethodSemanticsItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.MethodImpl:
            loader = pe.getMdtMethodImplItem.bind(pe);
            builder = generateMdtMethodImplItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.ModuleRef:
            loader = pe.getMdtModuleRefItem.bind(pe);
            builder = generateMdtModuleRefItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.TypeSpec:
            loader = pe.getMdtTypeSpecItem.bind(pe);
            builder = generateMdtTypeSpecItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.ImplMap:
            loader = pe.getMdtImplMapItem.bind(pe);
            builder = generateMdtImplMapItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.FieldRVA:
            loader = pe.getMdtFieldRVAItem.bind(pe);
            builder = generateMdtFieldRVAItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.ENCLog:
            loader = pe.getMdtENCLogItem.bind(pe);
            builder = generateMdtENCLogItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.ENCMap:
            loader = pe.getMdtENCMapItem.bind(pe);
            builder = generateMdtENCMapItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.Assembly:
            loader = pe.getMdtAssemblyItem.bind(pe);
            builder = generateMdtAssemblyItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.AssemblyProcessor:
            loader = pe.getMdtAssemblyProcessorItem.bind(pe);
            builder = generateMdtAssemblyProcessorItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.AssemblyOS:
            loader = pe.getMdtAssemblyOSItem.bind(pe);
            builder = generateMdtAssemblyOSItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.AssemblyRef:
            loader = pe.getMdtAssemblyRefItem.bind(pe);
            builder = generateMdtAssemblyRefItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.AssemblyRefProcessor:
            loader = pe.getMdtAssemblyRefProcessorItem.bind(pe);
            builder = generateMdtAssemblyRefProcessorItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.AssemblyRefOS:
            loader = pe.getMdtAssemblyRefOSItem.bind(pe);
            builder = generateMdtAssemblyRefOSItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.File:
            loader = pe.getMdtFileItem.bind(pe);
            builder = generateMdtFileItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.ExportedType:
            loader = pe.getMdtExportedTypeItem.bind(pe);
            builder = generateMdtExportedTypeItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.ManifestResource:
            loader = pe.getMdtManifestResourceItem.bind(pe);
            builder = generateMdtManifestResourceItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.NestedClass:
            loader = pe.getMdtNestedClassItem.bind(pe);
            builder = generateMdtNestedClassItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.GenericParam:
            loader = pe.getMdtGenericParamItem.bind(pe);
            builder = generateMdtGenericParamItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.MethodSpec:
            loader = pe.getMdtMethodSpecItem.bind(pe);
            builder = generateMdtMethodSpecItems as (item: S.FileData) => W.StructItem[];
            break;
        case F.MetadataTableIndex.GenericParamConstraint:
            loader = pe.getMdtGenericParamConstraintItem.bind(pe);
            builder = generateMdtGenericParamConstraintItems as (item: S.FileData) => W.StructItem[];
            break;
        default:
            return { title };
    }

    return generateSignleMdtTableItems(pe, tid, title, start, end, loader, builder);
}

function generateSignleMdtTableItems<T>(
    pe: PEImage, tid: F.MetadataTableIndex, title: string, start: number, end: number,
    loader: (rid: number) => T,
    builder: (item: T) => W.StructItem[]): W.GroupedStruct {
    let items: T[] = [];
    for (let rid = start; rid <= end; rid++) {
        items.push(loader(rid));
    }

    return {
        title,
        groups: items.map((v, i) => ({
            title: `${F.MetadataTableIndex[tid]} [${FM.formatHexDec(start + i)}]`,
            items: builder(v)
        }))
    };
}

function generateMdtModuleItems(item: S.MdtModuleItem): W.StructItem[] {
    return [
        FM.formatU2Field("Generation", item.Generation),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Mvid", item.Mvid),
        FM.formatU4Field("EncId", item.EncId),
        FM.formatU4Field("EncBaseId", item.EncBaseId),
    ];
}

function generateMdtTypeRefItems(item: S.MdtTypeRefItem): W.StructItem[] {
    return [
        FM.formatU4Field("ResolutionScope", item.ResolutionScope),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Namespace", item.Namespace),
    ];
}

function generateMdtTypeDefItems(item: S.MdtTypeDefItem): W.StructItem[] {
    return [
        FM.formatEnumField("Flags", item.Flags, F.CorTypeAttr),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Namespace", item.Namespace),
        FM.formatU4Field("Extends", item.Extends),
        FM.formatU4Field("FieldList", item.FieldList),
        FM.formatU4Field("MethodList", item.MethodList),
    ];
}

function generateMdtFieldPtrItems(item: S.MdtFieldPtrItem): W.StructItem[] {
    return [
        FM.formatU4Field("Field", item.Field),
    ];
}

function generateMdtFieldItems(item: S.MdtFieldItem): W.StructItem[] {
    return [
        FM.formatEnumField("Flags", item.Flags, F.CorFieldAttr),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Signature", item.Signature),
    ];
}

function generateMdtMethodPtrItems(item: S.MdtMethodPtrItem): W.StructItem[] {
    return [
        FM.formatU4Field("Method", item.Method),
    ];
}

function generateMdtMethodDefItems(item: S.MdtMethodDefItem): W.StructItem[] {
    return [
        FM.formatU4Field("RVA", item.RVA),
        FM.formatEnumField("ImplFlags", item.ImplFlags, F.CorMethodImpl),
        FM.formatEnumField("Flags", item.Flags, F.CorMethodAttr),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Signature", item.Signature),
        FM.formatU4Field("ParamList", item.ParamList),
    ];
}

function generateMdtParamPtrItems(item: S.MdtParamPtrItem): W.StructItem[] {
    return [
        FM.formatU4Field("Param", item.Param),
    ];
}

function generateMdtParamItems(item: S.MdtParamItem): W.StructItem[] {
    return [
        FM.formatEnumField("Flags", item.Flags, F.CorParamAttr),
        FM.formatU4Field("Sequence", item.Sequence),
        FM.formatU4Field("Name", item.Name),
    ];
}

function generateMdtInterfaceImplItems(item: S.MdtInterfaceImplItem): W.StructItem[] {
    return [
        FM.formatU4Field("Class", item.Class),
        FM.formatU4Field("Interface", item.Interface),
    ];
}

function generateMdtMemberRefItems(item: S.MdtMemberRefItem): W.StructItem[] {
    return [
        FM.formatU4Field("Class", item.Class),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Signature", item.Signature),
    ];
}

function generateMdtConstantItems(item: S.MdtConstantItem): W.StructItem[] {
    return [
        FM.formatEnumField("Type", item.Type, F.CorElementType),
        FM.formatU4Field("PaddingZero", item.PaddingZero),
        FM.formatU4Field("Parent", item.Parent),
        FM.formatU4Field("Value", item.Value),
    ];
}

function generateMdtCustomAttributeItems(item: S.MdtCustomAttributeItem): W.StructItem[] {
    return [
        FM.formatU4Field("Parent", item.Parent),
        FM.formatU4Field("Type", item.Type),
        FM.formatU4Field("Value", item.Value),
    ];
}

function generateMdtFieldMarshalItems(item: S.MdtFieldMarshalItem): W.StructItem[] {
    return [
        FM.formatU4Field("Parent", item.Parent),
        FM.formatU4Field("NativeType", item.NativeType),
    ];
}

function generateMdtDeclSecurityItems(item: S.MdtDeclSecurityItem): W.StructItem[] {
    return [
        FM.formatEnumField("Action", item.Action, F.CorDeclSecurity),
        FM.formatU4Field("Parent", item.Parent),
        FM.formatU4Field("PermissionSet", item.PermissionSet),
    ];
}

function generateMdtClassLayoutItems(item: S.MdtClassLayoutItem): W.StructItem[] {
    return [
        FM.formatU4Field("PackingSize", item.PackingSize),
        FM.formatU4Field("ClassSize", item.ClassSize),
        FM.formatU4Field("Parent", item.Parent),
    ];
}

function generateMdtFieldLayoutItems(item: S.MdtFieldLayoutItem): W.StructItem[] {
    return [
        FM.formatU4Field("OffSet", item.OffSet),
        FM.formatU4Field("Field", item.Field),
    ];
}

function generateMdtStandAloneSigItems(item: S.MdtStandAloneSigItem): W.StructItem[] {
    return [
        FM.formatU4Field("Signature", item.Signature),
    ];
}

function generateMdtEventMapItems(item: S.MdtEventMapItem): W.StructItem[] {
    return [
        FM.formatU4Field("Parent", item.Parent),
        FM.formatU4Field("EventList", item.EventList),
    ];
}

function generateMdtEventPtrItems(item: S.MdtEventPtrItem): W.StructItem[] {
    return [
        FM.formatU4Field("Generation", item.Event),
    ];
}

function generateMdtEventItems(item: S.MdtEventItem): W.StructItem[] {
    return [
        FM.formatEnumField("EventFlags", item.EventFlags, F.CorEventAttr),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("EventType", item.EventType),
    ];
}

function generateMdtPropertyMapItems(item: S.MdtPropertyMapItem): W.StructItem[] {
    return [
        FM.formatU4Field("Parent", item.Parent),
        FM.formatU4Field("PropertyList", item.PropertyList),
    ];
}

function generateMdtPropertyPtrItems(item: S.MdtPropertyPtrItem): W.StructItem[] {
    return [
        FM.formatU4Field("Property", item.Property),
    ];
}

function generateMdtPropertyItems(item: S.MdtPropertyItem): W.StructItem[] {
    return [
        FM.formatEnumField("PropFlags", item.PropFlags, F.CorPropertyAttr),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Type", item.Type),
    ];
}

function generateMdtMethodSemanticsItems(item: S.MdtMethodSemanticsItem): W.StructItem[] {
    return [
        FM.formatEnumField("Semantic", item.Semantic, F.CorMethodSemanticsAttr),
        FM.formatU4Field("Method", item.Method),
        FM.formatU4Field("Association", item.Association),
    ];
}

function generateMdtMethodImplItems(item: S.MdtMethodImplItem): W.StructItem[] {
    return [
        FM.formatU4Field("Class", item.Class),
        FM.formatU4Field("MethodBody", item.MethodBody),
        FM.formatU4Field("MethodDeclaration", item.MethodDeclaration),
    ];
}

function generateMdtModuleRefItems(item: S.MdtModuleRefItem): W.StructItem[] {
    return [
        FM.formatU4Field("Name", item.Name),
    ];
}

function generateMdtTypeSpecItems(item: S.MdtTypeSpecItem): W.StructItem[] {
    return [
        FM.formatU4Field("Signature", item.Signature),
    ];
}

function generateMdtImplMapItems(item: S.MdtImplMapItem): W.StructItem[] {
    return [
        FM.formatEnumField("MappingFlags", item.MappingFlags, F.CorPinvokeMap),
        FM.formatU4Field("MemberForwarded", item.MemberForwarded),
        FM.formatU4Field("ImportName", item.ImportName),
        FM.formatU4Field("ImportScope", item.ImportScope),
    ];
}

function generateMdtFieldRVAItems(item: S.MdtFieldRVAItem): W.StructItem[] {
    return [
        FM.formatU4Field("RVA", item.RVA),
        FM.formatU4Field("Field", item.Field),
    ];
}

function generateMdtENCLogItems(item: S.MdtENCLogItem): W.StructItem[] {
    return [
        FM.formatU4Field("Token", item.Token),
        FM.formatU4Field("FuncCode", item.FuncCode),
    ];
}

function generateMdtENCMapItems(item: S.MdtENCMapItem): W.StructItem[] {
    return [
        FM.formatU4Field("Token", item.Token),
    ];
}

function generateMdtAssemblyItems(item: S.MdtAssemblyItem): W.StructItem[] {
    return [
        FM.formatEnumField("HashAlgId", item.HashAlgId, F.AssemblyHashAlgorithm),
        FM.formatU4Field("MajorVersion", item.MajorVersion),
        FM.formatU4Field("MinorVersion", item.MinorVersion),
        FM.formatU4Field("BuildNumber", item.BuildNumber),
        FM.formatU4Field("RevisionNumber", item.RevisionNumber),
        FM.formatEnumField("Flags", item.Flags, F.CorAssemblyFlags),
        FM.formatU4Field("PublicKey", item.PublicKey),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Locale", item.Locale),
    ];
}

function generateMdtAssemblyProcessorItems(item: S.MdtAssemblyProcessorItem): W.StructItem[] {
    return [
        FM.formatU4Field("Processor", item.Processor),
    ];
}

function generateMdtAssemblyOSItems(item: S.MdtAssemblyOSItem): W.StructItem[] {
    return [
        FM.formatU4Field("OSPlatformID", item.OSPlatformID),
        FM.formatU4Field("OSMajorVersion", item.OSMajorVersion),
        FM.formatU4Field("OSMinorVersion", item.OSMinorVersion),
    ];
}

function generateMdtAssemblyRefItems(item: S.MdtAssemblyRefItem): W.StructItem[] {
    return [
        FM.formatU4Field("MajorVersion", item.MajorVersion),
        FM.formatU4Field("MinorVersion", item.MinorVersion),
        FM.formatU4Field("BuildNumber", item.BuildNumber),
        FM.formatU4Field("RevisionNumber", item.RevisionNumber),
        FM.formatEnumField("Flags", item.Flags, F.CorAssemblyFlags),
        FM.formatU4Field("PublicKeyOrToken", item.PublicKeyOrToken),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Locale", item.Locale),
        FM.formatU4Field("HashValue", item.HashValue),
    ];
}

function generateMdtAssemblyRefProcessorItems(item: S.MdtAssemblyRefProcessorItem): W.StructItem[] {
    return [
        FM.formatU4Field("Processor", item.Processor),
        FM.formatU4Field("AssemblyRef", item.AssemblyRef),
    ];
}

function generateMdtAssemblyRefOSItems(item: S.MdtAssemblyRefOSItem): W.StructItem[] {
    return [
        FM.formatU4Field("OSPlatformID", item.OSPlatformID),
        FM.formatU4Field("OSMajorVersion", item.OSMajorVersion),
        FM.formatU4Field("OSMinorVersion", item.OSMinorVersion),
        FM.formatU4Field("AssemblyRef", item.AssemblyRef),
    ];
}

function generateMdtFileItems(item: S.MdtFileItem): W.StructItem[] {
    return [
        FM.formatEnumField("Flags", item.Flags, F.CorFileFlags),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("HashValue", item.HashValue),
    ];
}

function generateMdtExportedTypeItems(item: S.MdtExportedTypeItem): W.StructItem[] {
    return [
        FM.formatEnumField("Flags", item.Flags, F.CorTypeAttr),
        FM.formatU4Field("TypeDefId", item.TypeDefId),
        FM.formatU4Field("TypeName", item.TypeName),
        FM.formatU4Field("TypeNamespace", item.TypeNamespace),
        FM.formatU4Field("Implementation", item.Implementation),
    ];
}

function generateMdtManifestResourceItems(item: S.MdtManifestResourceItem): W.StructItem[] {
    return [
        FM.formatU4Field("Offset", item.Offset),
        FM.formatEnumField("Flags", item.Flags, F.CorManifestResourceFlags),
        FM.formatU4Field("Name", item.Name),
        FM.formatU4Field("Implementation", item.Implementation),
    ];
}

function generateMdtNestedClassItems(item: S.MdtNestedClassItem): W.StructItem[] {
    return [
        FM.formatU4Field("NestedClass", item.NestedClass),
        FM.formatU4Field("EnclosingClass", item.EnclosingClass),
    ];
}

function generateMdtGenericParamItems(item: S.MdtGenericParamItem): W.StructItem[] {
    return [
        FM.formatU4Field("Number", item.Number),
        FM.formatEnumField("Flags", item.Flags, F.CorGenericParamAttr),
        FM.formatU4Field("Owner", item.Owner),
        FM.formatU4Field("Name", item.Name),
    ];
}

function generateMdtMethodSpecItems(item: S.MdtMethodSpecItem): W.StructItem[] {
    return [
        FM.formatU4Field("Method", item.Method),
        FM.formatU4Field("Instantiation", item.Instantiation),
    ];
}

function generateMdtGenericParamConstraintItems(item: S.MdtGenericParamConstraintItem): W.StructItem[] {
    return [
        FM.formatU4Field("Owner", item.Owner),
        FM.formatU4Field("Constraint", item.Constraint),
    ];
}

function generateMdtPaging(
    pe: PEImage,
    tid: F.MetadataTableIndex,
    cfg: G.GeneratorConfig,
    pgNum: number): W.Paging {
    const paging: W.Paging = {
        currentPageNumber: pgNum,
        pageNavList: []
    };

    const psz = cfg.mdtPageSize;
    const rows = pe.getMetadataTableRows(tid);
    const pages = Math.floor((rows + psz - 1) / psz);
    for (let p = 0; p < pages; p++) {
        const tblName = F.MetadataTableIndex[tid];
        const titleOf = (r: number) => `${tblName}[${FM.formatHexDec(r)}]`;
        const { start, end } = getRidOnPage(pe, tid, cfg, p);
        const target: W.NavTarget = {
            title: `Page[${p + 1}] (${titleOf(start)} - ${titleOf(end)})`,
            pageID: W.PageID.MDT_TBL,
            subID: tblName,
            pageNum: p,
        };
        paging.pageNavList.push(target);
    }

    return paging;
}

function getRidOnPage(
    pe: PEImage,
    tid: F.MetadataTableIndex,
    cfg: G.GeneratorConfig,
    pgNum: number): { start: number, end: number } {
    const psz = cfg.mdtPageSize;
    const rows = pe.getMetadataTableRows(tid);
    const start = pgNum * psz + 1;
    let end = start + psz - 1;
    if (end > rows) end = rows;
    return { start, end };
}