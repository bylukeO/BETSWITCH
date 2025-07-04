const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const ErrorResponse = require("../utils/errorResponse");

exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header first
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Get token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    // Fallback: Get token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};
