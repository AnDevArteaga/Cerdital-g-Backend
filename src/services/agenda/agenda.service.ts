import { getAgendaById, createAgenda } from "../../repositories/agenda.repository";
import { findClient } from "../../repositories/client.repository";

export const getAgendaByUserId = async (user_id: number) => {
    if (!user_id) throw new Error("Sin usuario");
    const agenda = await getAgendaById(user_id);
    if (!agenda) throw new Error("Agenda no encontrada");
    return agenda;
};

export const createAgendaUser = async (
    user_id: number,
    title: string,
    description: string,
    event_date: string,
    clientId: string | null = null,
) => {
    if (!title) throw new Error("No hay título");
    if (!description) throw new Error("No hay descripción");
    if (!event_date) throw new Error("No hay fecha");
    if (clientId) {
        const existing = await findClient("agenda", clientId, user_id);
        if (existing) return { message: "Agenda creada exitosamente", record: existing };
    }
    const agendaCreated = await createAgenda(
        user_id,
        title,
        description,
        event_date,
        clientId,
    );
    console.log('agendaCreated', agendaCreated);

    if (!agendaCreated) {
        if (!clientId) throw new Error("Hubo un error al crear la agenda");
        const existing = await findClient("agenda", clientId, user_id);
        if (!existing) throw new Error("Hubo un error al crear la agenda");
        return { message: "Agenda creada exitosamente", record: existing };
    }
    return { message: "Agenda creada exitosamente", record: agendaCreated };
};
