import { validationResult } from "express-validator";
import { Request } from "../../auth";
import { NextFunction, Response } from "express";


/**
 * Middleware para validar las solicitudes
 * @param req - La solicitud HTTP
 * @param res - La respuesta HTTP
 * @param next - La función para pasar al siguiente middleware
 * @returns 
 */

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        res.status(400).json({
            errors: errors.array().map(error => ({
                message: error.msg,
            }))
        });

        return;
    }
    next();
}