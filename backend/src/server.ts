import express, { Express } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { authRouter } from './auth'

const prisma = new PrismaClient();

// TODO: make cors config EX: https://github.com/davidleonmayor/course-Full-Stack-Node.js-React-TS-NestJS-Next.js-cashtrackr-backend/blob/main/src/server.ts
const server: Express = express();

// request config
server.use(cors());
server.use(express.json());

//Rutas
server.use("/auth", authRouter);

server.get("/", async (req: express.Request, res: express.Response) => {
  return res.json({ msg: "hello" });
});

server.get("/test", async (req: express.Request, res: express.Response) => {
  try {
    const personas = await prisma.pERSONA.findMany();
    return res.json(personas);
  } catch (error) {
    console.error(error);
  }
});

export default server;
