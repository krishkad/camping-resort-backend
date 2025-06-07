import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bookingRoute from "./routes/booking.routes";
import authRoute from "./routes/auth.routes";
import userRoute from "./routes/user.routes";
import holidayRoute from "./routes/holiday.routes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use("/api/booking", bookingRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/holiday", holidayRoute);

app.get("/", (req, res) => {
  const response: {
    success: boolean;
    message: string;
  } = { success: true, message: "ok" };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
