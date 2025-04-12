import cron from "node-cron"
import { getAgendasByDate, updateAgenda } from "../repositories/agenda.repository"
import { findUserById } from "../repositories/user.repository"
import admin from "../config/firebase"

// Este es el cron job que se ejecutará todos los días a las 12 AM
cron.schedule("0 0 * * *", async () => {
    try {

        // Obtener todas las agendas de la base de datos
        const agendas = await getAgendasByDate(new Date());  // Esta función buscará todas las agendas con fecha igual a hoy
        console.log('agendas', agendas)
        if (agendas.length > 0) {
            // Para cada agenda
            for (const agenda of agendas) {
                const usuario = await findUserById(agenda.id_usuario);
                console.log('usuario', usuario)
                if (usuario && usuario.token) {
                    // Enviar notificación a través de Firebase
                    await admin.messaging().send({
                        notification: {
                            title: agenda.titulo, // Título de la agenda
                            body: agenda.descripcion, // Descripción de la agenda
                            imageUrl: "https://i.postimg.cc/9fj0Q2VK/Recurso-1cerditalg-ico.png"
                        },
                        token: usuario.token, // Token de dispositivo del usuario
                    });
                    await updateAgenda(agenda.id_agenda)
                }

            }
        } else {
            console.log("No hay agendas para enviar notificaciones hoy.");
        }
    } catch (error) {
        console.error("Error al enviar notificaciones de agendas:", error);
    }
});