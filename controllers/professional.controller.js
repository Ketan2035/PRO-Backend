import Professional from "../models/professionalSchema.js";
import generateToken from "../utils/generateToken.js";

export const registerPro = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      name,
      email,
      mob,
      profession,
      experience,
      qualification,
      service_area,
      bio,
    } = req.body;

    const newProfessional = new Professional({
      name,
      email,
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
    const pro = await Professional.find();

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

export const getProfessionalById = async (req, res) => {
  try {
    const user = await Professional.findById(req.params.id);

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendProfessionalData = async (req, res) => {
  try {
    const user = await Professional.findById(req.user.id);
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