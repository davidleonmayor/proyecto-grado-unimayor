import path from "path";
import fs from "fs";
import express, { Application } from "express";
import cors from "cors";

import { logger, corsConfig, envs } from "./config";
import morganMiddleware from "./common/middleware/morgan";
import { disconnectPrisma } from "./config/prisma";
import { requestTimeout } from "./common/middleware/timeout";
import { errorHandler, notFound } from "./common/middleware/errorHandler";

import { AuthRoutes } from "./auth/auth.routes";
import { ProjectRoutes } from "./project/project.routes";
import { EventRoutes } from "./event/event.routes";
import { PersonRoutes } from "./person/person.routes";
import { MessagingRoutes } from "./messaging/messaging.routes";
import { ProyeccionSocialRoutes } from "./social-projection/socialProjection.routes";

export default class Server {
  private app: Application;
  private port = envs.PORT;

  constructor() {
    this.app = express();
    this.createLogDirectory();
    this.setupProcessHandlers();
    this.middlewares();
    this.routes();
  }

  private createLogDirectory() {
    const logDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }
  }

  private setupProcessHandlers() {
    process.on("uncaughtException", (err: Error) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      logger.error(err.stack);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      logger.error("💥 Unhandled Rejection detected!");
      logger.error("Reason:", reason);
      // NO llamar process.exit() aquí
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      await disconnectPrisma();
      process.exit(0);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  }

  private middlewares() {
    // Timeout global (PRIMERO)
    this.app.use(requestTimeout(30000)); // 30 segundos

    // Body parsers con límites
    this.app.use(
      express.json({
        limit: "10mb",
        strict: true, // Solo acepta arrays y objects
      }),
    );
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: "10mb",
      }),
    );

    // CORS
    this.app.use(cors(corsConfig));

    // Morgan para logging de HTTP
    this.app.use(morganMiddleware);
  }

  private routes() {
    // Health check
    this.app.get("/", (req, res) => {
      logger.info("Health check accessed");
      res.json({
        success: true,
        message: "API funcionando correctamente",
        timestamp: new Date().toISOString(),
        environment: envs.NODE_ENV || "development",
      });
    });

    // Test error route (solo desarrollo)
    if (envs.NODE_ENV === "development") {
      this.app.get("/error", (req, res, next) => {
        logger.warn("Test error route accessed");
        const error = new Error("Error de prueba");
        (error as any).statusCode = 400;
        next(error);
      });
    }

    // Rutas de la aplicación
    const authRoutes = new AuthRoutes();
    const projectRoutes = new ProjectRoutes();
    const eventRoutes = new EventRoutes();
    const personRoutes = new PersonRoutes();
    const messagingRoutes = new MessagingRoutes();
    const proyeccionSocialRoutes = new ProyeccionSocialRoutes();

    this.app.get("/api", (_req, res) => {
      res.send("Hello World!");
    });

    this.app.use("/api/auth", authRoutes.router);
    this.app.use("/api/projects", projectRoutes.router);
    this.app.use("/api/events", eventRoutes.router);
    this.app.use("/api/persons", personRoutes.router);
    this.app.use("/api/messaging", messagingRoutes.router);
    this.app.use("/api/proyeccion-social", proyeccionSocialRoutes.router);

    // 404 handler (ANTES del error handler)
    this.app.use(notFound);

    // Error handler global (SIEMPRE AL FINAL)
    this.app.use(errorHandler);
  }

  start() {
    this.app.listen(this.port, () => {
      logger.info(`🚀 Servidor ejecutándose en puerto ${this.port}`);
      logger.info(`🌍 Entorno: ${envs.NODE_ENV || "development"}`);
      logger.info(
        `📊 Logs guardándose en: ${path.join(process.cwd(), "logs")}`,
      );
    });
  }
}
