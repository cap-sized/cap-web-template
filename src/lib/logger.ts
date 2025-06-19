import { get_current_iso_date_time } from './datetime';
import { AlertLevel, type Alert } from './types/app';

const RED = "\u001b[31m";
const GREEN = "\u001b[32m";
const BLUE = "\u001b[34m";
const RESET = "\u001b[0m";

export class Logger {
	private endpoint: string;

	constructor(endpoint: string) {
		this.endpoint = endpoint;
	}

	private logstr(level: string, message: string): string {
		return `[${get_current_iso_date_time()}] <${level}> (${this.endpoint}): ${message}`;
	}

	log(message: Alert): void {
		switch (message.level) {
			case AlertLevel.Trace:
				this.trace(message.message);
				break;
			case AlertLevel.Debug:
				this.debug(message.message);
				break;
			case AlertLevel.Info:
				this.info(message.message);
				break;
			case AlertLevel.Success:
				this.success(message.message);
				break;
			case AlertLevel.Warning:
				this.warning(message.message);
				break;
			case AlertLevel.Error:
				this.error(message.message);
				break;
		}
	}

	// Specific methods for each log level
	error(message: any, ...others: any[]): void {
		console.log(this.logstr(`${RED}error${RESET}`, message), ...others);
	}

	warning(message: any, ...others: any[]): void {
		console.log(this.logstr(`${RED}warning${RESET}`, message), ...others);
	}

	success(message: any, ...others: any[]): void {
		console.log(this.logstr(`${GREEN}success${RESET}`, message), ...others);
	}

	info(message: any, ...others: any[]): void {
		console.log(this.logstr(`${GREEN}info${RESET}`, message), ...others);
	}

	debug(message: any, ...others: any[]): void {
		console.log(this.logstr(`${GREEN}debug${RESET}`, message), ...others);
	}

	trace(message: any, ...others: any[]): void {
		console.log(this.logstr(`${BLUE}trace${RESET}`, message), ...others);
	}
}
