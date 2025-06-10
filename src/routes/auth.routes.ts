import express, { Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import validator from "email-validator";
import disposableDomains from "disposable-email-domains";
import disposableEmailDetector from "disposable-email-detector";

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

// VEERIFY EMAIL ROUTE
router.post("/verify-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!validator.validate(email)) {
      res.status(400).json({ success: false, message: "Invalid email format" });
      return;
    }

    // Check for disposable email
    const emailDomain = email.split("@")[1].toLowerCase();
    if (
      disposableDomains.includes(emailDomain) ||
      emailDomain !== "gmail.com"
    ) {
      res.status(400).json({
        success: false,
        message: "Only g-mail addresses are allowed",
      });
      return;
    }
    const isDisposableEmail = await disposableEmailDetector(email);

    if (isDisposableEmail) {
      res.status(400).json({
        success: false,
        message: "Disposable email addresses are not allowed",
      });
      return;
    }

    res.status(201).json({ success: true, message: "ok" });
  } catch (error: any) {
    console.log("error while verifing email: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

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
    console.log(process.env.PRODUCTION_ENV === "production");
    const domain =
      process.env.PRODUCTION_ENV === "production"
        ? "camping-resort.vercel.app"
        : undefined;

    res.cookie("authtoken", token, {
      httpOnly: true,
      secure: process.env.PRODUCTION_ENV === "production",
      sameSite: process.env.PRODUCTION_ENV === "production" ? "none" : "lax",
      domain,

      path: "/",
    });

    console.log("token:", token);

    res.status(200).json({ success: true, data: userWithoutPassword });
  } catch (error: any) {
    console.log("Error login: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// LOG OUT ROUTE
router.get("/log-out", (req, res) => {
  try {
    res.clearCookie("authtoken", {
      path: "/", // ✅ ensure the path matches the one used when setting the cookie
    });

    res.status(200).json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error: any) {
    console.error("Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});

export default router;
