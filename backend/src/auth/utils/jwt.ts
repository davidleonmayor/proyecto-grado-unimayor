import jwt from "jsonwebtoken";

type Payload = {
  id: string;
  email: string;
};

export const generateJWT = (payload: Payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "6h",
  });
};
