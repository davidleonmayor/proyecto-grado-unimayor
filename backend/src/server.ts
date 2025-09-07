import { PrismaClient } from '@prisma/client'
import express, { Application } from 'express';
import { envs } from './config';
import cors from 'cors';
import colors from 'colors';
import { Routes } from './routes/routes';


class Server {

  private prisma: PrismaClient
  private app: Application;
  private port = envs.PORT;

  constructor() {
    this.prisma = new PrismaClient();
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares() {
    this.app.use(express.json());
    this.app.use(cors())
  }

  private routes() {
    Routes.init(this.app);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(
        colors.green.bold("[index]🎓 Graduation project ") +
        colors.cyan("running on port ") +
        colors.yellow(envs.PORT.toString())
      );
    })
  }


}

export default Server;