export function parseDuration(durationStr: string): number {
	const regex = /^(\d+)(ms|s|m|h)$/;
	const match = durationStr.match(regex);
	if (!match || match.length < 3) return 0;

	const value = parseInt(match[1]);
	const unit = match[2];
	// units: s, m, h
	let duration = 0;
	if (unit === "s") {
		return value * 1000;
	}

	if (unit === "m") {
		return value * 1000 * 60;
	}

	if (unit === "h") {
		return value * 1000 * 60 * 60;
	}

	// else if ms
	return value;
}
