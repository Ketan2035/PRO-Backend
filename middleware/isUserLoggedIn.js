import jwt from "jsonwebtoken";

export const isLoggedIn = (req, res, next) => {
  try {
    const token = req.cookies.token;
    // console.log("Cookies:", req.cookies);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User not logged in",
      });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; 
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};