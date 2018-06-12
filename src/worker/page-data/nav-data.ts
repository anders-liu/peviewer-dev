import { PEImage } from "../pe/image";
import * as F from "../pe/image-flags";

export function generateNavList(pe: PEImage): W.NavData[] {
    let navList: W.NavData[] = [generateHeadersNavData(pe)];

    const navMD = generateMDHeadersNavData(pe);
    if (navMD) navList.push(navMD);

    const navMDT = generateMDTablesNavData(pe);
    if (navMDT) navList.push(navMDT);

    return navList;
}

function generateHeadersNavData(pe: PEImage): W.NavData {
    const pageID = W.PageID.HEADERS;

    return {
        target: { pageID, title: W.KnownTitle.HEADERS },
        children: [{
            target: { pageID, title: W.KnownTitle.DOS_HEADER, elemID: W.KnownElemID.DOS_HEADER }
        }, {
            target: { pageID, title: W.KnownTitle.PE_SIGNATURE, elemID: W.KnownElemID.PE_SIGNATURE }
        }, {
            target: { pageID, title: W.KnownTitle.FILE_HEADER, elemID: W.KnownElemID.FILE_HEADER }
        }, {
            target: { pageID, title: W.KnownTitle.OPTIONAL_HEADER, elemID: W.KnownElemID.OPTIONAL_HEADER }
        }, {
            target: { pageID, title: W.KnownTitle.DATA_DIRECTORIES, elemID: W.KnownElemID.DATA_DIRECTORIES }
        }, {
            target: { pageID, title: W.KnownTitle.SECTION_HEADERS, elemID: W.KnownElemID.SECTION_HEADERS }
        }]
    };
}

function generateMDHeadersNavData(pe: PEImage): W.NavData | undefined {
    const pageID = W.PageID.MD_HEADERS;

    if (!pe.isManaged()) return undefined;

    let children: W.NavData[] = [{
        target: { pageID, title: W.KnownTitle.CLI_HEADER, elemID: W.KnownElemID.CLI_HEADER }
    }];

    if (pe.hasMetadata()) {
        children.push({
            target: { pageID, title: W.KnownTitle.MD_ROOT, elemID: W.KnownElemID.MD_ROOT }
        });
        children.push({
            target: { pageID, title: W.KnownTitle.MDS_HEADERS, elemID: W.KnownElemID.MDS_HEADERS }
        });
    }

    if (pe.hasStrongNameSignature()) {
        children.push({
            target: { pageID, title: W.KnownTitle.SN_SIG, elemID: W.KnownElemID.SN_SIG }
        });
    }

    if (pe.getMetadataStreamHeader(F.MetadataStreamName.Strings)) {
        children.push({
            target: { pageID: W.PageID.MDS_STRINGS, title: W.KnownTitle.MDS_STRINGS, pageNum: 0 }
        });
    }

    if (pe.getMetadataStreamHeader(F.MetadataStreamName.US)) {
        children.push({
            target: { pageID: W.PageID.MDS_US, title: W.KnownTitle.MDS_US, pageNum: 0 }
        });
    }

    if (pe.getMetadataStreamHeader(F.MetadataStreamName.GUID)) {
        children.push({
            target: { pageID: W.PageID.MDS_GUID, title: W.KnownTitle.MDS_GUID, pageNum: 0 }
        });
    }

    if (pe.getMetadataStreamHeader(F.MetadataStreamName.Blob)) {
        children.push({
            target: { pageID: W.PageID.MDS_BLOB, title: W.KnownTitle.MDS_BLOB, pageNum: 0 }
        });
    }

    return {
        target: { pageID, title: W.KnownTitle.MD_HEADERS },
        children
    };
}

function generateMDTablesNavData(pe: PEImage): W.NavData | undefined {
    const pageID = W.PageID.MDS_TABLE;
    const h = pe.getMetadataTableHeader();
    if (!h) return undefined;

    let children: W.NavData[] = [];

    if (pe.isMetadataTableValid(F.MetadataTableIndex.Module)) {
        children.push({
            target: { pageID: W.PageID.MDT_MODULE, title: W.KnownTitle.MDT_MODULE, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.TypeRef)) {
        children.push({
            target: { pageID: W.PageID.MDT_TYPEREF, title: W.KnownTitle.MDT_TYPEREF, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.TypeDef)) {
        children.push({
            target: { pageID: W.PageID.MDT_TYPEDEF, title: W.KnownTitle.MDT_TYPEDEF, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.FieldPtr)) {
        children.push({
            target: { pageID: W.PageID.MDT_FIELDPTR, title: W.KnownTitle.MDT_FIELDPTR, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.Field)) {
        children.push({
            target: { pageID: W.PageID.MDT_FIELD, title: W.KnownTitle.MDT_FIELD, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.MethodPtr)) {
        children.push({
            target: { pageID: W.PageID.MDT_METHODPTR, title: W.KnownTitle.MDT_METHODPTR, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.MethodDef)) {
        children.push({
            target: { pageID: W.PageID.MDT_METHODDEF, title: W.KnownTitle.MDT_METHODDEF, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.ParamPtr)) {
        children.push({
            target: { pageID: W.PageID.MDT_PARAMPTR, title: W.KnownTitle.MDT_PARAMPTR, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.Param)) {
        children.push({
            target: { pageID: W.PageID.MDT_PARAM, title: W.KnownTitle.MDT_PARAM, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.InterfaceImpl)) {
        children.push({
            target: { pageID: W.PageID.MDT_INTERFACEIMPL, title: W.KnownTitle.MDT_INTERFACEIMPL, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.MemberRef)) {
        children.push({
            target: { pageID: W.PageID.MDT_MEMBERREF, title: W.KnownTitle.MDT_MEMBERREF, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.Constant)) {
        children.push({
            target: { pageID: W.PageID.MDT_CONSTANT, title: W.KnownTitle.MDT_CONSTANT, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.CustomAttribute)) {
        children.push({
            target: { pageID: W.PageID.MDT_CUSTOMATTRIBUTE, title: W.KnownTitle.MDT_CUSTOMATTRIBUTE, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.FieldMarshal)) {
        children.push({
            target: { pageID: W.PageID.MDT_FIELDMARSHAL, title: W.KnownTitle.MDT_FIELDMARSHAL, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.DeclSecurity)) {
        children.push({
            target: { pageID: W.PageID.MDT_DECLSECURITY, title: W.KnownTitle.MDT_DECLSECURITY, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.ClassLayout)) {
        children.push({
            target: { pageID: W.PageID.MDT_CLASSLAYOUT, title: W.KnownTitle.MDT_CLASSLAYOUT, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.FieldLayout)) {
        children.push({
            target: { pageID: W.PageID.MDT_FIELDLAYOUT, title: W.KnownTitle.MDT_FIELDLAYOUT, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.StandAloneSig)) {
        children.push({
            target: { pageID: W.PageID.MDT_STANDALONESIG, title: W.KnownTitle.MDT_STANDALONESIG, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.EventMap)) {
        children.push({
            target: { pageID: W.PageID.MDT_EVENTMAP, title: W.KnownTitle.MDT_EVENTMAP, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.EventPtr)) {
        children.push({
            target: { pageID: W.PageID.MDT_EVENTPTR, title: W.KnownTitle.MDT_EVENTPTR, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.Event)) {
        children.push({
            target: { pageID: W.PageID.MDT_EVENT, title: W.KnownTitle.MDT_EVENT, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.PropertyMap)) {
        children.push({
            target: { pageID: W.PageID.MDT_PROPERTYMAP, title: W.KnownTitle.MDT_PROPERTYMAP, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.PropertyPtr)) {
        children.push({
            target: { pageID: W.PageID.MDT_PROPERTYPTR, title: W.KnownTitle.MDT_PROPERTYPTR, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.Property)) {
        children.push({
            target: { pageID: W.PageID.MDT_PROPERTY, title: W.KnownTitle.MDT_PROPERTY, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.MethodSemantics)) {
        children.push({
            target: { pageID: W.PageID.MDT_METHODSEMANTICS, title: W.KnownTitle.MDT_METHODSEMANTICS, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.MethodImpl)) {
        children.push({
            target: { pageID: W.PageID.MDT_METHODIMPL, title: W.KnownTitle.MDT_METHODIMPL, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.ModuleRef)) {
        children.push({
            target: { pageID: W.PageID.MDT_MODULEREF, title: W.KnownTitle.MDT_MODULEREF, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.TypeSpec)) {
        children.push({
            target: { pageID: W.PageID.MDT_TYPESPEC, title: W.KnownTitle.MDT_TYPESPEC, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.ImplMap)) {
        children.push({
            target: { pageID: W.PageID.MDT_IMPLMAP, title: W.KnownTitle.MDT_IMPLMAP, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.FieldRVA)) {
        children.push({
            target: { pageID: W.PageID.MDT_FIELDRVA, title: W.KnownTitle.MDT_FIELDRVA, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.ENCLog)) {
        children.push({
            target: { pageID: W.PageID.MDT_ENCLOG, title: W.KnownTitle.MDT_ENCLOG, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.ENCMap)) {
        children.push({
            target: { pageID: W.PageID.MDT_ENCMAP, title: W.KnownTitle.MDT_ENCMAP, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.Assembly)) {
        children.push({
            target: { pageID: W.PageID.MDT_ASSEMBLY, title: W.KnownTitle.MDT_ASSEMBLY, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.AssemblyProcessor)) {
        children.push({
            target: { pageID: W.PageID.MDT_ASSEMBLYPROCESSOR, title: W.KnownTitle.MDT_ASSEMBLYPROCESSOR, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.AssemblyOS)) {
        children.push({
            target: { pageID: W.PageID.MDT_ASSEMBLYOS, title: W.KnownTitle.MDT_ASSEMBLYOS, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.AssemblyRef)) {
        children.push({
            target: { pageID: W.PageID.MDT_ASSEMBLYREF, title: W.KnownTitle.MDT_ASSEMBLYREF, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.AssemblyRefProcessor)) {
        children.push({
            target: { pageID: W.PageID.MDT_ASSEMBLYREFPROCESSOR, title: W.KnownTitle.MDT_ASSEMBLYREFPROCESSOR, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.AssemblyRefOS)) {
        children.push({
            target: { pageID: W.PageID.MDT_ASSEMBLYREFOS, title: W.KnownTitle.MDT_ASSEMBLYREFOS, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.File)) {
        children.push({
            target: { pageID: W.PageID.MDT_FILE, title: W.KnownTitle.MDT_FILE, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.ExportedType)) {
        children.push({
            target: { pageID: W.PageID.MDT_EXPORTEDTYPE, title: W.KnownTitle.MDT_EXPORTEDTYPE, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.ManifestResource)) {
        children.push({
            target: { pageID: W.PageID.MDT_MANIFESTRESOURCE, title: W.KnownTitle.MDT_MANIFESTRESOURCE, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.NestedClass)) {
        children.push({
            target: { pageID: W.PageID.MDT_NESTEDCLASS, title: W.KnownTitle.MDT_NESTEDCLASS, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.GenericParam)) {
        children.push({
            target: { pageID: W.PageID.MDT_GENERICPARAM, title: W.KnownTitle.MDT_GENERICPARAM, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.MethodSpec)) {
        children.push({
            target: { pageID: W.PageID.MDT_METHODSPEC, title: W.KnownTitle.MDT_METHODSPEC, pageNum: 0 }
        });
    }

    if (pe.isMetadataTableValid(F.MetadataTableIndex.GenericParamConstraint)) {
        children.push({
            target: { pageID: W.PageID.MDT_GENERICPARAMCONSTRAINT, title: W.KnownTitle.MDT_GENERICPARAMCONSTRAINT, pageNum: 0 }
        });
    }

    return {
        target: { pageID, title: W.KnownTitle.MDS_TABLE },
        children
    };
}