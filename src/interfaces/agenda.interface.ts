import { Meta } from "./meta.interface";

export interface Agenda {
    id: number;
    title: string;
    description: string;
    event_date: string;
}

export interface AgendaResponse {
    agenda: Agenda[];
    meta: Meta;
}