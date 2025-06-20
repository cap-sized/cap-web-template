import type { DateString } from "./clickhouse";

export type Transaction = {
    //  transactions (
	// id String NOT NULL,
	// date DateTime(9, 'UTC') NULL,
	// team_id UInt64 NULL,
	// person_id UInt64 NOT NULL,
	// type_id UInt16 NOT NULL,
	// note String NOT NULL,
	// is_acq Boolean NOT NULL,
	// other_team_id UInt64 NULL,
	// updated_by String NOT NULL,
	// update_time DateTime(9, 'UTC') DEFAULT now64()
    id: string,
    date: DateString,
    team_id: number,
    person_id: number,
    type_id: number,
    note: number,
    is_acq: number,
    other_team_id?: number,
    updated_by: string,
    update_time: DateString,
};