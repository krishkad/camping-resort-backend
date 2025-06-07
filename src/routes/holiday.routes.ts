import express from "express";
import prisma from "../prisma";
import isAuthVerify from "../middleware/isauth.middleware";

const router = express.Router();

// GET ALL HOLIDAY
router.get("/all", isAuthVerify, async (req, res) => {
  try {
    const data = await prisma.holiday.findMany();

    if (!data || data.length <= 0) {
      res.status(200).json({ success: false, message: "no holidays" });
      return;
    }

    res.status(200).json({ success: true, message: "ok", data });
  } catch (error: any) {
    console.log("error while getting holidays: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// CREATE HOLIDAY ROUTE
router.post("/create", isAuthVerify, async (req, res) => {
  try {
    const { holidayName, holidayDescription, startDate, endDate } = req.body;

    if (!holidayName || !startDate || !endDate) {
      res.status(400).json({ success: false, message: "no body found" });
      return;
    }

    const newHoliday = await prisma.holiday.create({
      data: {
        holidayName,
        holidayDescription: holidayDescription && holidayDescription,
        startDate,
        endDate,
      },
    });

    if (!newHoliday) {
      res
        .status(500)
        .json({ success: false, message: "failed to create holiday" });
      return;
    }

    res.status(200).json({ success: true, message: "ok", data: newHoliday });
  } catch (error: any) {
    console.log("error while creating holiday: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// UPDATE HOLIDAY ROUTE
router.put("/update/:holidayId", isAuthVerify, async (req, res) => {
  try {
    const { holidayId } = req.params;

    const { holidayName, holidayDescription, startDate, endDate } = req.body;

    if (!holidayId) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }
    if (!holidayName || !startDate || !endDate) {
      res.status(400).json({ success: false, message: "no body found" });
      return;
    }

    const isHolidayExists = await prisma.holiday.findUnique({
      where: { id: holidayId },
    });

    if (!isHolidayExists) {
      res.status(401).json({ success: false, message: "no holiday exists" });
      return;
    }

    const updatedHoliday = await prisma.holiday.update({
      data: {
        holidayName,
        holidayDescription: holidayDescription && holidayDescription,
        startDate,
        endDate,
      },
      where: { id: holidayId },
    });

    if (!updatedHoliday) {
      res
        .status(500)
        .json({ success: false, message: "failed to update holiday" });
      return;
    }

    res
      .status(200)
      .json({ success: false, message: "ok", data: updatedHoliday });
  } catch (error: any) {
    console.log("error while updating holiday: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE HOLIDAY ROUTE
router.delete("/delete/:holidayId", isAuthVerify, async (req, res) => {
  try {
    const { holidayId } = req.params;

    if (!holidayId) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isHolidayExists = await prisma.holiday.findUnique({
      where: { id: holidayId },
    });

    if (!isHolidayExists) {
      res.status(401).json({ success: false, message: "no holiday exists" });
      return;
    }

    const deleteHoliday = await prisma.holiday.delete({
      where: { id: holidayId },
    });

    if (!deleteHoliday) {
      res
        .status(500)
        .json({ success: false, message: "failed to delete holiday" });
      return;
    }

    res.status(200).json({ success: true, message: "ok", data: deleteHoliday });
  } catch (error: any) {
    console.log("error while updating holiday: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;