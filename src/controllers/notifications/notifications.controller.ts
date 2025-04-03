// notificationController.ts
import { Request, Response } from 'express';
import admin from '../../config/firebase';

export const sendNotification = async (req: Request, res: Response) => {
  // Se espera recibir el token del dispositivo, título y cuerpo de la notificación
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Token, title y body son requeridos.' });
  }

  const message = {
    token,
    notification: {
      title,
      body,
    },
    // Opcional: agregar payload de datos
    // data: { key1: 'valor1', key2: 'valor2' },
  };

  try {
    const response = await admin.messaging().send(message);
    return res.json({ message: 'Notificación enviada correctamente', response });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return res.status(500).json({ error: 'Error al enviar notificación' });
  }
};
