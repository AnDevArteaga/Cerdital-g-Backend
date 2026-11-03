import { Request, Response } from "express";
import admin, { firebaseReady } from "../../config/firebase";
import { findUserById } from "../../repositories/user.repository";

export const sendTestPush = async (req: Request, res: Response) => {
    if (!firebaseReady) {
        res.status(503).json({ status: 503, message: "Firebase no está configurado." });
        return;
    }

    const user = await findUserById(Number(req.user.userId));
    if (!user?.token) {
        res.status(400).json({ status: 400, message: "Este usuario no tiene un dispositivo registrado." });
        return;
    }

    try {
        await admin.messaging().send({
            notification: {
                title: "Cerdital",
                body: "Notificación de prueba",
            },
            token: user.token,
        });
        res.status(200).json({ status: 200, message: "Notificación enviada" });
    } catch (error) {
        console.error("Error enviando notificación:", error);
        res.status(500).json({ status: 500, message: "Error al enviar la notificación" });
    }
};
