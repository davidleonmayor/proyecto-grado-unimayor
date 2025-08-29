import express, { Express } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const server: Express = express();

server.get("/", async (req: express.Request, res: express.Response) => {
  const facIng = await prisma.pROGRAMA_ACADEMICO.findMany();
  return res.json(facIng);
});

export default server;
