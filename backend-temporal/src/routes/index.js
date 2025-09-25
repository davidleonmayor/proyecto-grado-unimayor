import { Router } from "express";
import { sendEmailController } from "../controller/email.controller.js";
import { emailValidationRules } from "../validators/email.validator.js";

const router = Router();

router.post('/send-email', emailValidationRules, sendEmailController);

export default router;