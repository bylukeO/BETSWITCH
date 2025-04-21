const prisma = require("../utils/prisma");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Convert bet code
// @route   POST /api/conversions
// @access  Private
exports.convertBetCode = async (req, res, next) => {
  try {
    const { sourceCode, sourceBookmaker, targetBookmaker } = req.body;

    // Validate input
    if (!sourceCode || !sourceBookmaker || !targetBookmaker) {
      return next(new ErrorResponse("Please provide all required fields", 400));
    }

    // In a real application, this would contain the actual conversion logic
    // For now, we'll just simulate a conversion with a dummy algorithm
    const convertedCode = simulateConversion(
      sourceCode,
      sourceBookmaker,
      targetBookmaker
    );

    // Save the conversion to history
    const conversion = await prisma.conversion.create({
      data: {
        sourceCode,
        sourceBookmaker,
        targetBookmaker,
        convertedCode,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: conversion,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's conversion history
// @route   GET /api/conversions
// @access  Private
exports.getConversionHistory = async (req, res, next) => {
  try {
    const conversions = await prisma.conversion.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: conversions.length,
      data: conversions,
    });
  } catch (err) {
    next(err);
  }
};

// Simple function to simulate bet code conversion
// In a real app, this would be a more complex algorithm or API call
function simulateConversion(sourceCode, sourceBookmaker, targetBookmaker) {
  // This is a very simplistic simulation
  // In reality, you would have bookmaker-specific algorithms
  let prefix = targetBookmaker.substring(0, 2).toUpperCase();
  let suffix = sourceCode.replace(/[^0-9]/g, "").substring(0, 5);
  return `${prefix}-${suffix}`;
}
