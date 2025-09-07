import { Request } from "./interfaces/auth-request.interface" //usar este request para obtener información del usuario
import { Response } from "express"

import { AuthService } from './auth.service';

export class AuthController {

    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    async register(req: Request, res: Response) {
        const { name, email } = req.body;
        const user = await this.authService.createUser(name, email);
        res.status(201).json(user);
    }



}