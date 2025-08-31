import { Request } from "./interfaces/auth-request.interface" //usar este request para obtener información del usuario
import { Response } from "express"

//TODO:Por implementar

const register = (req: Request, res: Response) => {
    const { email, password } = req.body;

    res.status(201).json({
        message: 'Usuario creado con exito.',
        email
    })
}


const login = (req: Request, res: Response) => {

    const { email, password } = req.body;

    res.status(200).json({
        message: 'Usuario autenticado con exito.',
        email
    })
}


const renew = (req: Request, res: Response) => {

    const { id } = req.params;

    res.status(200).json({
        message: 'Token renovado con exito.',
        id
    })
}

export {
    register,
    login,
    renew
}