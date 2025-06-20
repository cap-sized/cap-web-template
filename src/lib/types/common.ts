export enum AlertLevel {
	Error = 0,
	Warning = 1,
	Success = 2,
	Info = 3,
	Debug = 4,
	Trace = 5,
}

export type Alert = {
	level: AlertLevel;
	message: string;
};