// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("✅ This is the NEW server.js file running...");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ FIX: Correct static path
const publicPath = path.join(__dirname, "dummy.sih");
app.use(express.static(publicPath));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// ✅ FIX: Correct import paths
import paymentRoutes from "./routes/payments-simple.js";
app.use("/api/payments", paymentRoutes);

// Feedback routes
import feedbackRoutes from "./routes/feedback.js";
app.use("/api/feedback", feedbackRoutes);

// ✅ EXTRA SAFETY: fallback if file not found
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "digitalanother.html"), (err) => {
    if (err) {
      res.send("Jharkhand Tourism Backend is running 🚀");
    }
  });
});

// HTTP server
const server = http.createServer(app);
const DEFAULT_PORT = process.env.PORT || 3000;

const startServer = (port) => {
  server.listen(port, () => {
    const address = server.address();
    console.log(`🚀 Server running on http://localhost:${address.port}`);
    console.log(`🌐 Serving static files from: ${publicPath}`);
    console.log(`📱 Visit: http://localhost:${address.port}`);
  });
};

// Start on default port
startServer(DEFAULT_PORT);

// Handle port conflicts
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.warn(`⚠️ Port ${DEFAULT_PORT} is in use. Trying a random free port...`);
    startServer(0);
  } else {
    console.error("❌ Server error:", err);
  }
});