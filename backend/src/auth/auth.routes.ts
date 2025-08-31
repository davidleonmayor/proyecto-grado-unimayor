import { Router } from "express";
import { register, login } from './auth.controller';
import { body } from 'express-validator';
import { validateRequest } from "../common";


const router: Router = Router();


// Crear Usuario
router.post('/register', [
    body('email', 'El email es obligatorio')
        .isEmail(),

    body('password', 'La contraseña es obligatoria')
        .notEmpty(),

    body('password', 'La contraseña debe tener al menos 6 caracteres')
        .isLength({ min: 6 }),
    validateRequest

], register);


//Iniciar Sesión
router.post('/login', [
    body('email', 'El email es obligatorio')
        .isEmail(),

    body('password', 'La contraseña es obligatoria')
        .notEmpty(),

    validateRequest

], login);


export default router;