import express from "express";
import dotenv from "dotenv";
import prisma from "../prisma";
import isAdminVerify from "../middleware/isadmin.middleware";
import isAuthVerify from "../middleware/isauth.middleware";

dotenv.config();
const router = express.Router();

router.get("/all", isAuthVerify, async (req, res) => {
  try {
    const data = await prisma.booking.findMany();

    if (data.length <= 0 || !data) {
      res.status(200).json({ success: false, message: "no bookings found" });
      return;
    }

    const response: { success: boolean; message: string; data?: any } = {
      success: true,
      message: "ok",
      data,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.log("error while fetching all booking: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// CREATE BOOKING ROUTE
router.post("/create", async (req, res) => {
  try {
    const {
      clientName,
      email,
      phoneNumber,
      checkInDate,
      checkOutDate,
      numberOfAdults,
      numberOfKids,
      roomType,
      foodPreference,
      roomNumber,
      specialRequests,
      amount,
    } = req.body;

    if (
      !clientName ||
      !email ||
      !phoneNumber ||
      !checkInDate ||
      !checkOutDate ||
      typeof numberOfAdults !== "number" ||
      typeof numberOfKids !== "number" ||
      !roomType ||
      !foodPreference ||
      !roomNumber ||
      !amount
    ) {
      console.log({
        clientName,
        email,
        phoneNumber,
        checkInDate,
        checkOutDate,
        numberOfAdults,
        numberOfKids,
        roomType,
        foodPreference,
        roomNumber,
        specialRequests,
        amount,
      });
      console.log({ data: req.body });
      res.status(400).json({ success: false, message: "body not found" });
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

    const booking = await prisma.booking.create({
      data: {
        clientName,
        email,
        phoneNumber,
        checkInDate,
        checkOutDate,
        numberOfAdults,
        numberOfKids,
        roomType,
        foodPreference,
        roomNumber,
        specialRequests,
        amount,
      },
    });

    if (!booking) {
      res
        .status(400)
        .json({ success: false, message: "failed to create booking" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Booking Created Successfully",
      data: booking,
    });
  } catch (error: any) {
    console.log("error while creating booking: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// UPDATE BOOKING ROUTE
router.put("/update/:bookingId", isAuthVerify, async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const {
      clientName,
      email,
      phoneNumber,
      checkInDate,
      checkOutDate,
      numberOfAdults,
      numberOfKids,
      roomType,
      foodPreference,
      roomNumber,
      checkInStatus,
      bookingStatus,
      paymentStatus,
      specialRequests,
      amount,
    } = req.body;

   
    if (
      !clientName ||
      !email ||
      !phoneNumber ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfAdults ||
      numberOfKids === undefined ||
      !roomType ||
      !foodPreference ||
      !roomNumber ||
      !checkInStatus ||
      !bookingStatus ||
      !paymentStatus ||
      !specialRequests ||
      !amount
    ) {
      res.status(400).json({ success: false, message: "body not found" });
      return;
    }

    const isBookingExists = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!isBookingExists) {
      res.status(400).json({ success: false, message: "no booking exists" });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      data: {
        clientName,
        email,
        phoneNumber,
        checkInDate,
        checkOutDate,
        numberOfAdults,
        numberOfKids,
        roomType,
        foodPreference,
        roomNumber,
        checkInStatus,
        bookingStatus,
        paymentStatus,
        specialRequests,
        amount,
      },
      where: { id: bookingId },
    });

    if (!updatedBooking) {
      res
        .status(400)
        .json({ success: false, message: "failed to update the booking" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedBooking,
    });
  } catch (error: any) {
    console.log("error while updating booking: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE BOOKING ROUTE
router.delete("/delete/:bookingId", isAdminVerify, async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      res.json({ success: false, message: "Invalid creadentials" });
      return;
    }

    const isBookingExists = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!isBookingExists) {
      res.json({ success: false, message: "no booking found" });
      return;
    }

    const deletedBooking = await prisma.booking.delete({
      where: { id: bookingId },
    });

    res.json({
      success: true,
      message: "Booking deleted successfully",
      booking: deletedBooking,
    });
  } catch (error: any) {
    console.log("error while deleting booking: ", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
