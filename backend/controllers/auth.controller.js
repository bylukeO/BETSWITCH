const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return next(new ErrorResponse("Email already registered", 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse("Please provide email and password", 400));
    }

    // Check for user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        password: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Create user object without password for token
    const userWithoutPassword = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    // Send token response with remember setting
    sendTokenResponse(userWithoutPassword, 200, res, remember);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return next(new ErrorResponse("No user found with that email", 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;

    // Create message
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit: \n\n${resetUrl}`;

    // Hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire time
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset token info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpire,
      },
    });

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      console.error(err);

      // Remove reset token fields from user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpire: null,
        },
      });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpire: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid token", 400));
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });

    // Return success
    res.status(200).json({
      success: true,
      data: "Password reset successful",
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, remember = false) => {
  // Create token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: remember ? "30d" : "1d", // Use longer expiration if remember me is checked
  });

  // Still set cookie as fallback, but we'll primarily use the token in response body
  const options = {
    expires: new Date(Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  // Set cookie and return token in body
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token, // This is what we'll use on the client
    user,
  });
};
