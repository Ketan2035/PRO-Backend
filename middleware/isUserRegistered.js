import Customer from "../models/customerSchema.js";
import Professional from "../models/professionalSchema.js";

export const isUserRegistered = async (req, res, next) => {
  try {
    let { email } = req.body;

    email = email.trim().toLowerCase();

    const customer = await Customer.findOne({ email });
    const professional = await Professional.findOne({ email });

    if (!customer && !professional) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    req.userData = customer || professional;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
