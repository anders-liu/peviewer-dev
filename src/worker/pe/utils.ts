export function calculatePadding(dataSize: number, align: number = 4): number {
    const r = dataSize % align;
    if (r == 0) {
        return 0;
    } else {
        return align - r;
    }
}

export function count1(n: number) {
    let c = 0;
    for (let i = 0, mask = 1; i < 32; i++ , mask <<= 1) {
        if (n & mask)
            c++;
    }
    return c;
}

export function isSetLong(high: number, low: number, bit: number): boolean {
    return bit >= 0 && bit < 64 &&
        (bit < 32 && ((low & (1 << bit)) != 0)) ||
        (bit >= 32 && (high & (1 << (bit - 32))) != 0);
}

export function decompressUint(data: Uint8Array): number {
    if ((data[0] & 0x80) == 0 && data.buffer.byteLength == 1)
        return data[0];
    else if ((data[0] & 0xC0) == 0x80 && data.buffer.byteLength == 2)
        return (data[0] & 0x3F) << 8 | data[1];
    else if ((data[0] & 0xE0) == 0xC0 && data.buffer.byteLength == 4)
        return (data[0] & 0x1F) << 24 | data[1] << 16 | data[2] << 8 | data[3];
    else
        throw new RangeError();
}

export function decompressInt(data: Uint8Array): number {
    const u = decompressUint(data);
    if ((u & 0x00000001) == 0)
        return (u >> 1);

    const fb = data[0];
    if ((fb & 0x80) == 0)
        return (u >> 1) | 0xFFFFFFC0;
    else if ((fb & 0xC0) == 0x80)
        return (u >> 1) | 0xFFFFE000;
    else if ((fb & 0xE0) == 0xC0)
        return (u >> 1) | 0xF0000000;
    else
        throw new RangeError();
}

export function getCompressedIntSize(firstByte: number): number {
    if ((firstByte & 0xFFFFFF00) != 0)
        throw new RangeError();
    else if ((firstByte & 0x80) == 0)
        return 1;
    else if ((firstByte & 0xC0) == 0x80)
        return 2;
    else if ((firstByte & 0xE0) == 0xC0)
        return 4;
    else
        throw new RangeError();
}