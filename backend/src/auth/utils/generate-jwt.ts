import jwt from 'jsonwebtoken';
import { envs } from '../../config';
import { UUIDTypes } from 'uuid';


/**
 * Genera un token JWT para un usuario
 * @param uid - El ID del usuario
 * @returns El token JWT generado o null en caso de error
 */

export const generateJWT = (uid: UUIDTypes) => {
    try {
        const token = jwt.sign(
            { uid },
            envs.JWT_SECRET, {
            expiresIn: '24h'
        });
        return token;
    } catch (error) {
        console.error('[generateJWT]: Error generating JWT:', error);
        return null;
    }
}