import bcrypt from "bcryptjs";

import User from "../models/User.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.staus(400).json({ message: "user must sign in first" });
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.staus(400).json({ message: "false password" });

    generateTokenAndSetCookie(user.id, res);
    res.status(200).json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("error in login controller", error.message);
    res.status(500).json({ message: "server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Loggged out successfully" });
  } catch (error) {
    console.log("error in login controller", error.message);
    res.status(500).json({ message: "server error" });
  }
};

export const signup = async (req, res) => {
  try {
    const { fullName, username, password, gender } = req.body;
    // if (password !== confirmPassword) {
    //   return res.status(400).json({ message: "password didn't match" });
    // }

    const user = await User.findOne({ username });

    if (user) {
      return res.status(200).json({ message: "user already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,

      gender,
      profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
    });

    if (newUser) {
      await newUser.save();
      generateTokenAndSetCookie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.fullName,
        profilePic: newUser.profilePic,
        gender: newUser.gender,
      });
    } else {
      res.status(400).json({ error: "invalid user data" });
    }
  } catch (error) {
    console.log("error in signup controller", error.message);
    res.status(500).json({ message: "server error" });
  }
};
