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

    // POST /teachers — Create teacher (admin only)
    this.router.post(
      "/teachers",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.createTeacher,
    );

    // POST /students — Create student (admin only)
    this.router.post(
      "/students",
      this.authMiddleware.isAuthenticatedUser,
      this.authMiddleware.isConfirmed,
      this.roleMiddleware.isPrivilegedUser,
      this.controller.createStudent,
    );

    this.router.get(
      "/:id",
      validateSchema(GetPersonByIdSchema),
      this.authMiddleware.isAuthenticatedUser,
      this.controller.getPersonById,
    );
  }
}
