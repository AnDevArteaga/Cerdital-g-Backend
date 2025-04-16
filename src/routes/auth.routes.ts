import { Router } from "express";
import { login, register, checkUser, changePassword, logout } from "../controllers/auth/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Inicia sesión de usuario
 *     description: Recibe las credenciales del usuario para iniciar sesión.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */

router.post("/login", login);
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     description: Crea una nueva cuenta de usuario con los datos proporcionados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */

router.post("/register", register);
/**
 * @swagger
 * /checkUser:
 *   post:
 *     summary: Verifica si un usuario ya está registrado
 *     description: Comprueba si existe un usuario con el correo electrónico proporcionado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado o no
 *       400:
 *         description: Error en la petición
 */
router.post("/checkUser", checkUser);
/**
 * @swagger
 * /changePassword:
 *   post:
 *     summary: Cambia la contraseña de un usuario
 *     description: Permite cambiar la contraseña de un usuario mediante su correo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       400:
 *         description: Error en la operación
 */
router.post("/changePassword", changePassword);
router.post("/logout/:id", authMiddleware, logout);

export default router;