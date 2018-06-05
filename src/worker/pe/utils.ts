export function calculatePadding(dataSize: number, align: number = 4): number {
    const r = dataSize % align;
    if (r == 0) {
        return 0;
    } else {
        return align - r;
    }
}