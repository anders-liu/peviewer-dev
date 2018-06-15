import * as S from "../pe/structures";

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

export function formatHexDec(d: number): string {
    return `${d.toString(16).toUpperCase()}h (${d.toLocaleString()})`;
}

export function formatDec(v: number): string {
    return v.toLocaleString();
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

export function formatU1Field(name: string, f: S.U1Field, showDec?: boolean): W.StructItem {
    return formatUIntField(name, f, 1, showDec);
}

export function formatU2Field(name: string, f: S.U2Field, showDec?: boolean): W.StructItem {
    return formatUIntField(name, f, 2, showDec);
}

export function formatU4Field(name: string, f: S.U4Field, showDec?: boolean): W.StructItem {
    return formatUIntField(name, f, 4, showDec);
}

export function formatU8Field(name: string, f: S.U8Field, showDec?: boolean): W.StructItem {
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
    };
}

export function formatCompressedUIntField(name: string, f: S.CompressedUIntField): W.StructItem {
    return formatUIntField(name, f, f._size, true);
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

function padZeroLeft(str: string, len: number): string {
    if (str.length < len) {
        return "0".repeat(len - str.length) + str;
    } else {
        return str;
    }
}

function formatUIntField(name: string, f: S.UIntField, sz: number, showDec?: boolean): W.StructItem {
    let hex: string;
    switch (sz) {
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
    }
}
