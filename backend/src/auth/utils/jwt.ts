import jwt from "jsonwebtoken";
import { envs } from "../../config";

type Payload = {
  id: string;
  email: string;
};

export const generateJWT = (payload: Payload) => {
  return jwt.sign(payload, envs.JWT_SECRET, {
    expiresIn: "6h",
  });
};
