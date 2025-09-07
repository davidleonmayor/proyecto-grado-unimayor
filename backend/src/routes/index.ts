import { Application } from "express";
import { AuthRoutes } from "../auth";
import { ExampleRoutes } from "../example";


/**
 * Este archivo centraliza todas las rutas de la aplicación.
 * 
 * Cada módulo (usuarios, pagos, deudas, etc.) tiene su propia clase de rutas
 * y se importa aquí para montarlas en la instancia principal de Express.
 * 
 * Esto permite:
 * 1. Mantener el servidor limpio y modular.
 * 2. Escalar fácilmente agregando nuevos módulos de rutas.
 * 3. Aplicar middlewares globales o específicos de cada módulo de forma organizada.
 * 
 * Uso:
 * En el servidor principal:
 *    Routes.init(app);
 */

export class Routes {

    public static init(app: Application) {

        //Aquí agregan las rutas de cada modulo.
        const authRoutes = new AuthRoutes();
        const exampleRoutes = new ExampleRoutes();

        app.use('/api/auth', authRoutes.router);
        app.use('/api/example', exampleRoutes.router)

    }
}