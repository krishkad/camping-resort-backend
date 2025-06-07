import express, { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Interface for the expected request body
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phoneNo: string;
  salary: number;
  address: string;
}

// Interface for the response
interface ResponseType {
  success: boolean;
  message: string;
  data?: any;
}

const router: express.Router = express.Router();

// CREATE USER ROUTE
router.post(
  "/create-user",
  async (
    req: Request<unknown, unknown, CreateUserRequest>,
    res: Response<ResponseType>
  ): Promise<void> => {
    try {
      const { name, email, password, phoneNo, salary, address } = req.body;

      // Validate required fields
      if (!name || !email || !password || !phoneNo || !salary || !address) {
        res.status(400).json({
          success: false,
          message: "All fields are required",
        });
        return;
      }

      // Additional validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
        return;
      }

      const isUser = await prisma.user.findFirst({ where: { email } });
      if (isUser) {
        res.status(400).json({ success: false, message: "User already Exist" });
        return;
      }

      const hashpassword = bcrypt.hashSync(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashpassword,
          address,
          salary,
          phoneNo,
        },
      });

      if (!newUser) {
        res
          .status(400)
          .json({ success: false, message: "failed to create user" });
        return;
      }

      const { password: _, ...userWithoutPassword } = newUser;

      const tokenData = {
        id: userWithoutPassword.id,
        Role: userWithoutPassword.Role,
      };

      const token = jwt.sign(tokenData, process.env.JWT_SECRET!);

      res.cookie("authtoken", token);

      res.status(200).json({
        success: true,
        message: "user created successful",
        data: userWithoutPassword,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// LOG-IN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.json({ success: false, message: "body not found!" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
      return;
    }

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      res.status(400).json({ success: false, message: "User does not exist!" });
      return;
    }

    const comparehash = bcrypt.compareSync(password, user.password);

    if (!comparehash) {
      res.status(400).json({ success: false, message: "Invalid Credentials" });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;

    const tokenData = {
      id: user.id,
      Role: user.Role,
    };

    const token = jwt.sign(tokenData, process.env.JWT_SECRET!);

    res.cookie("authtoken", token);

    res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    console.log("Error login: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
