const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

// Import middleware
const { errorHandler } = require("./middlewares/error.middleware");

// Import routes - using consistent naming convention
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const conversionRoutes = require("./routes/conversion.routes");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Configure CORS for development - expanded to handle more origins
app.use(
  cors({
    // Include all possible ways the frontend might be accessed
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://127.0.0.1:5501",
      "http://localhost:5501",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Other middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// For debugging cookies
app.use((req, res, next) => {
  console.log("Cookies received:", req.cookies);
  console.log("Request origin:", req.headers.origin);
  console.log("Request host:", req.headers.host);
  next();
});

// Static files (if needed)
app.use(express.static(path.join(__dirname, "../")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversions", conversionRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
