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

export type OrderParams = { [key: string]: 'ASC' | 'DESC' };

export type PaginationParams = { page: number; perpage: number };

export type TableView<T> = { table_data: T; view_name: string };
