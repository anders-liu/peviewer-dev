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