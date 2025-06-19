export type TimeSpanUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w';

/** `TimeSpan` is borrowed from lucia-v3. */
export class TimeSpan {
	constructor(value: number, unit: TimeSpanUnit) {
		this.value = value;
		this.unit = unit;
	}

	public value: number;
	public unit: TimeSpanUnit;

	public milliseconds(): number {
		if (this.unit === 'ms') {
			return this.value;
		}
		if (this.unit === 's') {
			return this.value * 1000;
		}
		if (this.unit === 'm') {
			return this.value * 1000 * 60;
		}
		if (this.unit === 'h') {
			return this.value * 1000 * 60 * 60;
		}
		if (this.unit === 'd') {
			return this.value * 1000 * 60 * 60 * 24;
		}
		return this.value * 1000 * 60 * 60 * 24 * 7;
	}

	public seconds(): number {
		return this.milliseconds() / 1000;
	}

	public transform(x: number): TimeSpan {
		return new TimeSpan(Math.round(this.milliseconds() * x), 'ms');
	}

	public lt(span: TimeSpan) : boolean {
		return this.milliseconds() < span.milliseconds();
	}

	public gt(span: TimeSpan) : boolean {
		return this.milliseconds() > span.milliseconds();
	}

	public lte(span: TimeSpan) : boolean {
		return this.milliseconds() <= span.milliseconds();
	}

	public gte(span: TimeSpan) : boolean {
		return this.milliseconds() >= span.milliseconds();
	}

	public eq(span: TimeSpan) : boolean {
		return this.milliseconds() == span.milliseconds();
	}
}

export function now_is_before(date: Date): boolean {
	return new Date().getTime() < date.getTime();
}

export function time_span_between(target: Date, start: Date = new Date()): TimeSpan {
	return new TimeSpan(target.getTime() - start.getTime(), "ms");
}

export function create_datetime_after(from: Date, timeSpan: TimeSpan): Date {
	return new Date(from.getTime() + timeSpan.milliseconds());
}

export function get_now_utc(): Date {
	return new Date();
}

export function get_current_iso_date_time(): string {
	return new Date().toISOString();
}

export function strftime(dt: Date, format: "ISO_UTC" | "default"): string {
	switch (format) {
		case "ISO_UTC":
			const p = (val: number) => val.toString().padStart(2, "0")
			return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}T${p(dt.getUTCHours())}:${p(dt.getUTCMinutes())}:${p(dt.getUTCSeconds())}.${p(dt.getUTCMilliseconds())}`;
		case "default":
			return dt.toUTCString();
	}
}