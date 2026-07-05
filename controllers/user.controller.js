import Customer from "../models/customerSchema.js";
import Professional from "../models/professionalSchema.js";
import generateToken from "../utils/generateToken.js";

import bcrypt from "bcrypt";

export const registerCustomer = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { name, email, password, mobile, city, address } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newCustomer = new Customer({
      name,
      email,
      password: hashedPassword,
      mob_no: mobile,
      city,
      address,
      role: "customer",
    });
    await newCustomer.save();
    generateToken(newCustomer, res);
    console.log("register");
    res.status(201).json({
      message: "User created successfully",
      user: newCustomer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const sendCustomerData = async (req, res) => {
  try {
    const user = await Customer.findById(req.user.id);
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

//save address
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user.id;
    // Find customer
    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    customer.address.push(address);
    await customer.save();
    // console.log("hitted");
    res.status(200).json({
      success: true,
      message: "Address added successfully",
      addresses: customer.address,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//delete address
export const deleteAddress = async (req, res) => {
  try {
    const { index } = req.params;
    const userId = req.user.id;

    const customer = await Customer.findById(userId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    customer.address.splice(index, 1);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Address deleted",
      addresses: customer.address,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

import jwt from "jsonwebtoken";

export const getMe = async (req, res) => {
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

    const { id, role } = decoded;

    let user = null;

    if (role === "customer") {
      user = await Customer.findById(id);
    } else if (role === "professional") {
      user = await Professional.findById(id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
      role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
