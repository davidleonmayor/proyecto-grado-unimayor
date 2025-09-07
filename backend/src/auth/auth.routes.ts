import { Router } from 'express';
import { AuthController } from './auth.controller';
import { body, } from 'express-validator';
import { validateRequest } from '../common'

export class AuthRoutes {

    public router: Router;
    private authController: AuthController;

    constructor() {
        this.router = Router();
        this.authController = new AuthController();
        this.initRoutes();
    }

    private initRoutes() {

        this.router.post(
            '/register',
            [
                body('name', 'El nombre es obligatorio').notEmpty(),
                body('email').isEmail().withMessage('Correo invalido'),
                validateRequest,
                this.authController.register
            ]
        );

    }
}