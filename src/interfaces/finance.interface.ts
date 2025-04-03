import { Meta } from "./meta.interface";

export interface Cost {
    cost_id: number;
    batch_id: number;
    compra_cerdos: number;
    alimentacion: number;
    medicamentos: number;
    mano_obra: number;
    transporte: number;
    otros: number;
    fecha_creacion: string;
}

export interface CostResponse {
    cost: Cost[];
    meta: Meta;
} 

export interface Sales {
    sales_id: number;
    batch_id: string;
    pig_sold: number;
    average_weight: number;
    price_kg: number;
    date_created: string;
}

export interface SalesResponse {
    sales: Sales[];
    meta: Meta;
}