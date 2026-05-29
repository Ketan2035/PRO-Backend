import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateToken = (user, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    `${process.env.SECRET_KEY}`,
    {
      expiresIn: "1d",
    },
  );
  console.log("my token", token);
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
  return token;
};

export default generateToken;
