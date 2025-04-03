import { Meta } from "./meta.interface";

export interface Feeding {
    id: number;
    batch_id: string;
    feeding_type: string;
    feeding_mark: string;
    amount: number;
    const: number;
    date_created: string;
}

export interface FeedingResponse {
    feeding: Feeding[];
    meta: Meta;
}