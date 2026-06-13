import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";

import bookingsRoutes from "./routes/bookings.js";
import restaurantsRoutes from "./routes/restaurants.js";
import reviewsRoutes from "./routes/reviews.js";
import mpesaRoutes from "./routes/mpesa.js";
import smsRoutes from "./routes/sms.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", (data) => {
    if (data.userId) socket.join("user:" + data.userId);
    if (data.restaurantId) socket.join("restaurant:" + data.restaurantId);
    if (data.role) socket.join(data.role);
    console.log("Joined rooms:", data);
  });

  // Group booking request
  socket.on("group_booking_submitted", (data) => {
    console.log("Group booking submitted:", data);
    if (data.restaurantId) {
      io.to("restaurant:" + data.restaurantId).emit("group_booking_request", data);
    }
    io.to("admin").emit("group_booking_request", data);
  });

  // Group booking response
  socket.on("group_booking_response", (data) => {
    console.log("Group booking response:", data);
    if (data.dinerId) {
      io.to("user:" + data.dinerId).emit("group_booking_response", data);
    }
  });

  // Dining invite
  socket.on("dining_invite", (data) => {
    console.log("Dining invite:", data);
    if (data.targetUserId) {
      io.to("user:" + data.targetUserId).emit("dining_invite_received", data);
    }
  });

  // Check-in
  socket.on("diner_checked_in", (data) => {
    console.log("Diner checked in:", data);
    if (data.restaurantId) {
      io.to("restaurant:" + data.restaurantId).emit("diner_checked_in", data);
    }
    io.to("admin").emit("diner_checked_in", data);
  });

  // Booking adjusted
  socket.on("booking_adjusted", (data) => {
    console.log("Booking adjusted:", data);
    if (data.restaurantId) {
      io.to("restaurant:" + data.restaurantId).emit("booking_adjusted", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.use("/api/bookings", bookingsRoutes);
app.use("/api/restaurants", restaurantsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/mpesa", mpesaRoutes);
app.use("/api/sms", smsRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), connections: io.engine.clientsCount });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pocketbite")
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log("Server running on port " + PORT));
  })
  .catch((err) => console.error("MongoDB error:", err));