export class AuthService {

    createUser = async (email: string, password: string) => {
        return {
            message: 'Usuario creado',
            email,
            password
        };
    }

}