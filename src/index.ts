import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bookingRoute from "./routes/booking.routes";
import authRoute from "./routes/auth.routes";
import userRoute from "./routes/user.routes";
import holidayRoute from "./routes/holiday.routes";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: `${process.env.CORS_ORIGIN_URL!}`,
    credentials: true,
  })
);
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN_URL!);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/booking", bookingRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/holiday", holidayRoute);

app.get("/", (req, res) => {
  res.json("welcome");
});

app.get("/", (req, res) => {
  const response: {
    success: boolean;
    message: string;
  } = { success: true, message: "ok" };

  res.json(response);
});

export default app;

// app.listen(PORT, () => {
//   console.log(`server is running on port: ${PORT}`);
// });
