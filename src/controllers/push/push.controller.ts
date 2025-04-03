import { Request, Response } from "express";
import admin from "../../config/firebase";

export const sendTestPush = async (req: Request, res: Response) => {

    const { token } = req.body;
    try {
    await admin.messaging().send({
      notification: {
        title: "Todo bien hablamos",
        body: "Hola desde el backend 🎉",
      },
      token: token,
    });

    res.status(200).json({ message: "Notificación enviada exitosamente" });
  } catch (error) {
    console.error("Error enviando notificación:", error);
    res.status(500).json({ message: "Error al enviar la notificación" });
  }
};
