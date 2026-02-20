import { ExampleController } from "./example.controller";
import { Router } from "express";

/**
 * Archivo de rutas de un módulo.
 *
 * Responsabilidades:
 * - Definir los endpoints HTTP del módulo (GET, POST, PUT, DELETE, etc.).
 * - Aplicar middlewares específicos a cada ruta, como:
 *      - Validaciones (express-validator)
 *      - Autenticación o autorización
 *      - Otros middlewares personalizados
 * - Delegar la lógica al controlador correspondiente.
 *
 * Nota: Las rutas no deben contener lógica de negocio ni acceso directo a la base de datos.
 */

export class ExampleRoutes {
    public router: Router;
    private exampleController: ExampleController;

    constructor() {
        this.router = Router();
        this.exampleController = new ExampleController();
        this.initRoutes();
    }

    public initRoutes() {
        this.router.get(
            "/hello",
            [
                /**Validaciones de express validator */
            ],
            this.exampleController.sendHelloMessage,
        );
    }
}
