import { Application, Router } from "express";
import { AuthRoutes } from "../auth/auth.routes";
import { ExampleRoutes } from "../example/example.routes";
import { ProjectRoutes } from "./project.routes";
import { EventRoutes } from "./event.routes";
import { PersonRoutes } from "./person.routes";
import { MessagingRoutes } from "../messaging/messaging.routes";

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

        authRoutes.initRoutes();
        exampleRoutes.initRoutes();

        const projectRoutes = new ProjectRoutes();
        const eventRoutes = new EventRoutes();
        const personRoutes = new PersonRoutes();
        const messagingRoutes = new MessagingRoutes();
        messagingRoutes.initRoutes();

        app.get("/api", (req, res) => {
            res.send("Hello World!");
        });
        app.use("/api/auth", authRoutes.router);
        app.use("/api/example", exampleRoutes.router);
        app.use("/api/projects", projectRoutes.router);
        app.use("/api/events", eventRoutes.router);
        app.use("/api/persons", personRoutes.router);
        app.use("/api/messaging", messagingRoutes.router);
    }
}
