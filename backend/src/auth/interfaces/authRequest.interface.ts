import { User } from "@prisma/client";
import type { Request as Req } from "express";

export interface Request extends Req {
  user?: User;
}
