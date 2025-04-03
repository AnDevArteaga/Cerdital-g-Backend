import { Meta } from "./meta.interface";



interface Statistics {
    batchsActive: number;
    totalCosts: number;
    totalSales: number;
    profit: number;
    batchsByPhase: Array<{ phase: string; batchs: number }>;
}

export interface HomeResponse {
    statistics: Statistics;
    meta: Meta;
}