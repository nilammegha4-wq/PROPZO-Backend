import User from "../models/User.js";
import Property from "../models/Property.js";
import History from "../models/history.js";
import SiteSetting from "../models/SiteSetting.js";
import bcrypt from "bcryptjs";

/**
 * GET ALL USERS
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE USER
 */
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET ALL PROPERTIES (ADMIN)
 */
export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("createdBy", "name email");
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * APPROVE / REJECT PROPERTY
 */
export const updatePropertyStatus = async (req, res) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.status = status;
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllHistory = async (req, res) => {
  res.json(await History.find().populate("user property"));
};

/**
 * ADMIN PROFILE APIs
 */
export const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("name email phone");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    const updatedUser = await user.save();
    res.status(200).json({ success: true, user: { name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SITE SETTINGS APIs
 */
export const getSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSiteSettings = async (req, res) => {
  try {
    const { siteName, supportEmail, currency } = req.body;
    let settings = await SiteSetting.findOne();

    if (!settings) {
      settings = new SiteSetting({ siteName, supportEmail, currency });
    } else {
      settings.siteName = siteName || settings.siteName;
      settings.supportEmail = supportEmail || settings.supportEmail;
      settings.currency = currency || settings.currency;
    }

    await settings.save();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};