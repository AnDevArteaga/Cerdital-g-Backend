


interface Record {
    progress_id: number;
    date_weight: Date;
    weekly_average_weight: number;
}

export interface ListProgressLote {
    batch_id: number;
    mortality: number;
    goal_average_weight: number;
    record: Record[];
}

export interface Progress {
    progress: ListProgressLote[];
}


