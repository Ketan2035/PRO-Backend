import Customer from "../models/customerSchema.js";
import Professional from "../models/professionalSchema.js";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";
import generateToken from "../utils/generateToken.js";

const transporter = nodemailer.createTransport({
  // secure:true,
  service: "gmail",
  auth: {
    user: "ketankumar147856@gmail.com",
    pass: "aalg larh xjpi jhjq",
  },
});

export const sendMail = async (req, res) => {
  try {
    let { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const mailOptions = {
      from: "ketankumar147856@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is 
      ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};
//verify function
const verifyOTP = async (email, userOtp) => {
  const record = await OTP.findOne({ email });
  if (!record) {
    return { success: false, message: "No OTP found" };
  }

  // check expiry
  if (record.expiresAt < new Date()) {
    return { success: false, message: "OTP expired" };
  }

  // check match
  if (record.otp !== userOtp) {
    return { success: false, message: "Invalid OTP" };
  }
  await OTP.deleteMany({ email });
  return { success: true, message: "OTP verified" };
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    let user =
      (await Customer.findOne({ email })) ||
      (await Professional.findOne({ email }));
    console.log(user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const result = await verifyOTP(email, otp);
    if (result.message == "OTP verified") {
      await generateToken(user, res);
    }
    console.log("mai second user hu", user);
    result.user = user;
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
