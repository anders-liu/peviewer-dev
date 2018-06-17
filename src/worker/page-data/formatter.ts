import * as S from "../pe/structures";
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from "constants";

export function formatU1RawHex(d: number): string {
    return padZeroLeft(d.toString(16).toUpperCase(), 2);
}

export function formatU2RawHex(d: number): string {
    return padZeroLeft(d.toString(16).toUpperCase(), 4);
}

export function formatU4RawHex(d: number): string {
    return padZeroLeft(d.toString(16).toUpperCase(), 8);
}

export function formatU1Hex(d: number): string {
    return `${formatU1RawHex(d)}h`;
}

export function formatU2Hex(d: number): string {
    return `${formatU2RawHex(d)}h`;
}

export function formatU4Hex(d: number): string {
    return `${formatU4RawHex(d)}h`;
}

export function formatRawHex(d: number): string {
    return d.toString(16).toUpperCase();
}

export function formatHex(d: number): string {
    return `${formatRawHex(d)}h`;
}

export function formatDec(v: number): string {
    return v.toLocaleString();
}

export function formatHexDec(d: number): string {
    return `${formatHex(d)}h (${formatDec(d)})`;
}

export function formatBytes(bytes: Uint8Array, lineWidth: number = 16): string[] {
    let lines: string[] = [];
    for (let start = 0; start < bytes.length; start += lineWidth) {
        const line = Array.from(bytes.subarray(start, start + lineWidth))
            .map(b => formatU1RawHex(b)).join("-");
        lines.push(line);
    }
    return lines;
}

export function formatStructTitle(s: S.FileData, title: string): string {
    return `${title} [${formatU4Hex(s._offset)} - ${formatU4Hex(s._offset + s._size)} : ${formatHexDec(s._size)}]`;
}

export function formatU1Field(name: string, f: S.U1Field, showDec?: boolean, desc?: W.ItemDescription[]): W.StructItem {
    return formatUIntField(name, f, showDec, desc);
}

export function formatU2Field(name: string, f: S.U2Field, showDec?: boolean, desc?: W.ItemDescription[]): W.StructItem {
    return formatUIntField(name, f, showDec, desc);
}

export function formatU4Field(name: string, f: S.U4Field, showDec?: boolean, desc?: W.ItemDescription[]): W.StructItem {
    return formatUIntField(name, f, showDec, desc);
}

export function formatU8Field(name: string, f: S.U8Field, showDec?: boolean, desc?: W.ItemDescription[]): W.StructItem {
    let value = `${formatU4RawHex(f.high)} ${formatU4Hex(f.low)}`;

    if (showDec && f.high < 0x1FFFFF) {
        const long = f.high * 0x100000000 + f.low;
        value += ` (${formatDec(long)})`;
    }

    return {
        offset: formatU4Hex(f._offset),
        size: formatHexDec(f._size),
        rawData: formatBytes(f.data),
        name,
        value,
        descriptions: desc
    };
}

export function formatCompressedUIntField(name: string, f: S.CompressedUIntField): W.StructItem {
    return formatUIntField(name, f, true);
}

export function formatBytesField(name: string, f: S.Field): W.StructItem {
    return {
        offset: formatU4Hex(f._offset),
        size: formatHexDec(f._size),
        rawData: formatBytes(f.data),
        name,
        value: "",
    };
}

export function formatStringField(name: string, f: S.StringField): W.StructItem {
    return {
        offset: formatU4Hex(f._offset),
        size: formatHexDec(f._size),
        rawData: formatBytes(f.data),
        name,
        value: `"${f.value}"`,
    };
}

export function formatGuidField(name: string, f: S.Field): W.StructItem {
    const b = (n: number) => formatU1RawHex(f.data[n]);
    const value = "{" + b(3) + b(2) + b(1) + b(0) + "-"
        + b(5) + b(4) + "-" + b(7) + b(6) + "-" + b(8) + b(9) + "-"
        + b(10) + b(11) + b(12) + b(13) + b(14) + b(15) + "}";

    return {
        offset: formatU4Hex(f._offset),
        size: formatHexDec(f._size),
        rawData: formatBytes(f.data),
        name,
        value,
    };
}

export function formatEnumField<T>(name: string, f: S.EnumField<T>, enumType: any): W.StructItem {
    const desc = formatEnumDesc(enumType, f.value, f._size);
    return formatUIntField(name, f as any as S.UIntField, false, [desc]);
}

function padZeroLeft(str: string, len: number): string {
    if (str.length < len) {
        return "0".repeat(len - str.length) + str;
    } else {
        return str;
    }
}

function formatUIntField(name: string, f: S.UIntField, showDec?: boolean, desc?: W.ItemDescription[]): W.StructItem {
    let hex: string;
    switch (f._size) {
        case 1: hex = formatU1Hex(f.value); break;
        case 2: hex = formatU2Hex(f.value); break;
        case 4: hex = formatU4Hex(f.value); break;
        default: hex = f.value.toString(16).toUpperCase(); break;
    }

    return {
        offset: formatU4Hex(f._offset),
        size: formatHexDec(f._size),
        rawData: formatBytes(f.data),
        name,
        value: showDec ? `${hex} (${formatDec(f.value)})` : hex,
        descriptions: desc
    }
}

function formatEnumDesc<T>(enumType: any, v: T, sz: number): W.ItemGroupedLinesDescription {
    const groups = !enumType.__FLAG__ ?
        [formatNonFlagEnum(enumType, v, sz)] : formatFlagEnum(enumType, v, sz);

    return {
        type: W.ItemDescriptionType.GRPL,
        groups
    };
}

function formatNonFlagEnum<T>(enumType: any, v: T, sz: number): { lines: string[] } {
    let lines: string[] = [];

    let fmt: (d: number) => string;
    switch (sz) {
        case 1: fmt = formatU1Hex; break;
        case 2: fmt = formatU2Hex; break;
        case 4: fmt = formatU4Hex; break;
        default: fmt = formatHex; break;
    }

    for (let key in enumType) {
        if (typeof enumType[key] === "number") {
            const val = enumType[key];
            if (v === val) {
                lines.push(key);
            }
        }
    }

    return { lines };
}

function formatFlagEnum<T>(enumType: any, v: T, sz: number): {
    title?: string;
    lines: string[];
}[] {
    let lines: string[] = [];

    const grpList = getFlagEnumGroups(enumType, sz);

    for (const key in grpList) {
        if (grpList[key].mask == 0) {
            grpList[key].values
                .filter(ev => (ev.value & (v as any as number)) != 0)
                .forEach(ev => lines.push(ev.name));
        } else {
            const mv = grpList[key].mask & (v as any as number);
            const sv = grpList[key].values.filter(ev => ev.value == mv).shift();
            if (sv) lines.push(sv.name);
        }
    }

    return [{ lines }];
}

function getFlagEnumGroups(enumType: any, sz: number): FlagEnumGroupList {
    if (!flagEnumGroupCache[enumType.__NAME__]) {
        buildEnumGroups(enumType, sz);
    }

    return flagEnumGroupCache[enumType.__NAME__];
}

function buildEnumGroups(enumType: any, sz: number): void {
    let allValues: { name: string, value: number }[] = [];

    for (const key in enumType) {
        if (typeof enumType[key] === "number") {
            allValues.push({ name: key, value: enumType[key] });
        }
    }

    let grpList: FlagEnumGroupList = {
        "": { mask: 0, values: [] }
    };

    let fmt: (d: number) => string;
    switch (sz) {
        case 1: fmt = formatU1Hex; break;
        case 2: fmt = formatU2Hex; break;
        case 4: fmt = formatU4Hex; break;
        default: fmt = formatHex; break;
    }

    let grpName = "", grpPrefix = "", grpMask = 0;

    for (const v of allValues) {
        // If it's a valud of a group...
        if (grpPrefix && v.name.startsWith(grpPrefix)) {
            grpList[grpName] = grpList[grpName] || { mask: grpMask, values: [] };
            grpList[grpName].values.push({
                name: `(${fmt(v.value)}) ${v.name.substring(grpPrefix.length, v.name.length)}`,
                value: v.value
            });
            continue;
        }

        // If it's a group mask...
        const rs = regexFlagEnumGroupMask.exec(v.name);
        if (rs) {
            grpName = rs[2];
            grpPrefix = rs[1];
            grpMask = v.value;
            continue;
        } else {
            grpName = "";
            grpPrefix = "";
            grpMask = 0;
        }

        // If it's a non-grouped value...
        grpList[""].values.push({
            name: `(${fmt(v.value)}) ${v.name}`,
            value: v.value
        });
    }

    flagEnumGroupCache[enumType.__NAME__] = grpList;
}

interface FlagEnumGroup {
    mask: number;
    values: {
        name: string, value: number
    }[];
}

interface FlagEnumGroupList {
    [key /* group name */: string]: FlagEnumGroup;
}

interface FlagEnumGroupCache {
    [key /* enum name */: string]: FlagEnumGroupList;
}

let flagEnumGroupCache: FlagEnumGroupCache = {};

const regexFlagEnumGroupMask = /^([a-z]+_)_Mask__([a-zA-Z]+)$/;