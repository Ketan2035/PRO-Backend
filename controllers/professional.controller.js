import Professional from "../models/professionalSchema.js";
import generateToken from "../utils/generateToken.js";

import bcrypt from "bcrypt";

export const registerPro = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      name,
      email,
      password,
      mob,
      profession,
      experience,
      qualification,
      service_area,
      bio,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newProfessional = new Professional({
      name,
      email,
      password: hashedPassword,
      mob,
      profession,
      experience,
      qualification,
      service_area,
      bio,
      role: "professional",
    });

    await newProfessional.save();
    generateToken(newProfessional, res);
    console.log("register");
    res.status(201).json({
      message: "User created successfully",
      user: newProfessional,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProfessionals = async (req, res) => {
  try {
    const pro = await Professional.find({ verificationStatus: 'verified' });

    res.status(200).json({
      success: true,
      data: pro,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

import mongoose from "mongoose";

export const getProfessionalById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(); // Fall through if not a valid ID, allows other routes to match
    }

    const user = await Professional.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Professional not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import jwt from "jsonwebtoken";

export const sendProfessionalData = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(200).json({ success: false, message: "Not logged in" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(200).json({ success: false, message: "Invalid token" });
    }

    const user = await Professional.findById(decoded.id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const uploadKyc = async (req, res) => {
  try {
    const { idType, idNumber } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No ID proof image uploaded" });
    }

    const professional = await Professional.findById(req.user.id);
    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional not found" });
    }

    professional.idProof = {
      type: idType,
      number: idNumber,
      image: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
      }
    };
    
    // We can set isVerified to false upon new KYC upload so admin can verify it
    professional.isVerified = false; 

    await professional.save();

    res.status(200).json({
      success: true,
      message: "KYC document uploaded successfully",
      idProof: professional.idProof,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const professional = await Professional.findById(req.user.id);
    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional not found" });
    }

    professional.profileImage = {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
    };

    await professional.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: professional.profileImage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    const professional = await Professional.findById(req.user.id);
    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional not found" });
    }

    professional.location = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)], // GeoJSON format: [longitude, latitude]
    };

    await professional.save();

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location: professional.location,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const professional = await Professional.findById(req.user.id || req.user._id);
    if (!professional) {
      return res.status(404).json({ success: false, message: "Professional not found" });
    }

    professional.isAvailable = !professional.isAvailable;
    await professional.save();

    res.status(200).json({
      success: true,
      message: `Availability updated to ${professional.isAvailable ? "Online" : "Offline"}`,
      isAvailable: professional.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};