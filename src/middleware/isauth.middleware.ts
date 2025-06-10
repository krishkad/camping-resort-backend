import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { RoleType } from "@prisma/client";

dotenv.config();

interface MyJwtPayload extends JwtPayload {
  id: string;
  Role: RoleType;
}

const isAuthVerify = async (req: any, res: Response, next: NextFunction) => {
  const token = req.cookies.authtoken;

  if (!token) {
    res.status(400).json({ success: false, message: "not authorized" });
    return;
  }

  const tokenData = jwt.verify(token, process.env.JWT_SECRET!) as MyJwtPayload;

  if (!tokenData) {
    res.status(400).json({ success: false, message: "not authorized" });
    return;
  }

  if (
    tokenData.Role !== "Admin" &&
    tokenData.Role !== "Receptionist" &&
    tokenData.Role !== "Manager"
  ) {
    res.status(403).json({ success: false, message: "not authorized" });
    return;
  }

  req.data = req.body;
  next();
};

export default isAuthVerify;
