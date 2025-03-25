import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
const registerUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return res
        .status(400)
        .json({ message: "Enter all the required fields", success: false });
    }
    const file = req.file;

    let cloudResponse;
    if (file) {
      const fileUri = getDataUri(file);
      if (fileUri) {
        cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
          resource_type: "raw",
          public_id: file.originalname.split(".")[0],
          overwrite: true,
        });
      }
    }
    const checkExistingUser = await User.findOne({ email });
    if (checkExistingUser) {
      return res
        .status(400)
        .json({ message: "User already registered", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,

      ...(cloudResponse && {
        profile: {
          profilePhoto: cloudResponse.secure_url,
        },
      }),
    });
    return res
      .status(201)
      .json({ message: `Account Created successfully`, success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Enter all the required fields", success: false });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Wrong Username or password", success: false });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: "Password is incorrect", success: false });
    }
    if (role !== user.role) {
      return res.status(400).json({
        message: "Account does not exist with current role",
        success: false,
      });
    }
    const tokenData = {
      userId: user._id,
    };
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });
    const userDetails = {
      _id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
      email: user.email,
    };
    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        userDetails,
        success: true,
      });
  } catch (err) {
    console.log(err);

    return res
      .status(500)
      .json({ message: "Something went wrong", err, success: false });
  }
};

const logoutUser = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "Logged out successfully", success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;

    const file = req.file;

    let cloudResponse;
    if (file) {
      const fileUri = getDataUri(file);
      if (fileUri) {
        cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
          resource_type: "raw",
          public_id: file.originalname.split(".")[0],
          overwrite: true,
        });
      }
    }

    //cloudinary aaega idhar

    const skillsArray = skills && skills.split(",");
    const userId = req.id;
    let user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;
    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url; //save the cloudinary url
      user.profile.resumeOriginalName = file.originalname; //save the original file name on resume
    }

    await user.save();
    user = {
      _id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
      email: user.email,
    };
    return res
      .status(200)
      .json({ message: "Profile Updated Successfully", user, success: true });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Something went wrong", success: false });
  }
};

export { registerUser, loginUser, logoutUser, updateProfile };
