import { Router } from "express";
import { PersonController } from "./person.controller";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware";
import { RoleMiddleware } from "../common/middleware/RoleMiddleware";
import { validateSchema } from "../common/middleware/validateSchema";
import {
  GetPersonByIdSchema,
  GetStudentsSchema,
  GetTeachersSchema,
} from "./person.schema";

export class PersonRoutes {
  public router: Router;
  private controller: PersonController;
  private authMiddleware: AuthMiddleware;
  private roleMiddleware: RoleMiddleware;

  constructor() {
    this.router = Router();
    this.controller = new PersonController();
    this.authMiddleware = new AuthMiddleware();
    this.roleMiddleware = new RoleMiddleware();
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(
      "/teachers",
      validateSchema(GetTeachersSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.getTeachers,
    );

    this.router.get(
      "/students",
      validateSchema(GetStudentsSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.getStudents,
    );

    this.router.get(
      "/:id",
      validateSchema(GetPersonByIdSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getPersonById,
    );
  }
}
