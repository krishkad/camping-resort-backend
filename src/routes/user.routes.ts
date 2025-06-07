import express from "express";
import prisma from "../prisma";
import isAdminVerify from "../middleware/isadmin.middleware";

const router = express.Router();

// GET ALL USERS ROUTE
router.get("/all", isAdminVerify, async (req, res) => {
  try {
    const data = await prisma.user.findMany();

    if (!data || data.length <= 0) {
      res.status(200).json({ success: false, message: "no user found" });
      return;
    }

    const users = data.map(
      ({ password, ...userWithoutPassword }) => userWithoutPassword
    );

    res
      .status(200)
      .json({ success: true, message: "user fetch successfull", data: users });
  } catch (error: any) {
    console.log("error while fetching all user: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// UPDATE USER ROUTE
router.put("/update/:userId", isAdminVerify, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const { name, email, phoneNo, address, salary, Role } = req.body;

    if (!name || !email || !phoneNo || !address || !salary) {
      res.status(400).json({ success: false, message: "no body found" });
      return;
    }

    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });

    if (!isUserExist) {
      res.status(400).json({ success: false, message: "user does not exist" });
      return;
    }

    const updatedUser = await prisma.user.update({
      data: {
        name,
        email,
        phoneNo,
        salary,
        address,
        Role: Role && Role,
      },
      where: { id: userId },
    });

    if (!updatedUser) {
      res
        .status(500)
        .json({ success: false, message: "failed to update user" });
      return;
    }

    const { password: _, ...updatedUserWithoutPassword } = updatedUser;

    res.json({
      success: true,
      message: "user updated successfully",
      data: updatedUserWithoutPassword,
    });
  } catch (error: any) {
    console.log("error while updating user: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE USER ROUTE
router.delete("/delete/:userId", isAdminVerify, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isUserExist = await prisma.user.findUnique({ where: { id: userId } });

    if (!isUserExist) {
      res.status(400).json({ success: false, message: "no user exist" });
      return;
    }

    const deletedUser = await prisma.user.delete({ where: { id: userId } });

    if (!deletedUser) {
      res
        .status(500)
        .json({ success: false, message: "failed to delete user" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "user delete successfully",
      data: deletedUser,
    });
  } catch (error: any) {
    console.log("error while deleting user: ", error);
    res.status(401).json({ success: false, message: "Internal server error" });
  }
});

export default router;