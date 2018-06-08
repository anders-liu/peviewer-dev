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