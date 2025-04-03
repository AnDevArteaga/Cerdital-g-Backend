import { getAgendaById, createAgenda } from "../../repositories/agenda.repository";

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
) => {
    const agendaCreated = await createAgenda(
        user_id,
        title,
        description,
        event_date,
    );
    console.log('agendaCreated', agendaCreated);

    if (agendaCreated === 0) throw new Error("Hubo un error al crear la agenda");
    return agendaCreated;
};
