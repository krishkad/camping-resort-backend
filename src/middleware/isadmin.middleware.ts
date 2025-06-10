import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


interface MyJwtPayload extends jwt.JwtPayload {
  id: string;
  Role: string;
}


const isAdminVerify = (req: any, res: Response, next: NextFunction) => {
  const token = req.cookies.authtoken

  if (!token) {
    res.status(400).json({ success: false, message: "Invalid credentials" });
    return;
  }

  const tokenData = jwt.verify(token, process.env.JWT_SECRET!) as MyJwtPayload;

  if (!tokenData) {
    res.status(400).json({ success: false, message: "Invalid credentials" });
    return;
  }

  if (tokenData.Role !== "Admin") {
    res.status(302).json({ success: false, message: "not authorized" });
    return;
  }
  req.data = req.body;
  next();
};

export default isAdminVerify;
