// // import User from "../models/User.js";

// // /* =========================
// //    GET ALL USERS
// // ========================= */
// // export const getUsers = async (req, res) => {
// //   try {
// //     const users = await User.find().select("-password"); // 🔐 hide password
// //     res.status(200).json(users);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// // /* =========================
// //    GET USER BY ID
// // ========================= */
// // export const getUserById = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.params.id).select("-password");

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     res.status(200).json(user);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };


// // /* =========================
// //    DELETE USER
// // ========================= */
// // export const deleteUser = async (req, res) => {
// //   try {
// //     const user = await User.findByIdAndDelete(req.params.id);

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     res.status(200).json({ message: "User deleted successfully" });
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // };
// import User from "../models/User.js";

// /* =========================
//    GET ALL USERS
// ========================= */
// export const getUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-password"); // hide password
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// /* =========================
//    GET USER BY ID
// ========================= */
// export const getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// /* =========================
//    UPDATE USER
// ========================= */
// export const updateUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Update basic fields
//     if (req.body.name !== undefined) {
//       user.name = req.body.name;
//     }

//     if (req.body.email !== undefined) {
//       user.email = req.body.email;
//     }

//     if (req.body.phone !== undefined) {
//       user.phone = req.body.phone;
//     }

//     if (req.body.address !== undefined) {
//       user.address = req.body.address;
//     }

//     // 🔥 FIX: Update avatar properly
//     if (req.body.avatar !== undefined) {
//       user.avatar = req.body.avatar;
//     }

//     // Update password if provided
//     if (req.body.password) {
//       user.password = req.body.password;
//     }

//     const updatedUser = await user.save();

//     // Remove password before sending response
//     const userResponse = updatedUser.toObject();
//     delete userResponse.password;

//     res.status(200).json(userResponse);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// /* =========================
//    DELETE USER
// ========================= */
// export const deleteUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import User from "../models/User.js";
import Booking from "../models/Booking.js";
import RentalBooking from "../models/RentalBooking.js";
import PreRentBooking from "../models/PreRentBooking.js";
import Property from "../models/Property.js";
import SaleProperty from "../models/SaleProperty.js";

/* =========================
   GET ALL USERS
========================= */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // 🔐 hide password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =========================
   GET USER BY ID
========================= */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =========================
   DELETE USER
========================= */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET USER PROFILE STATISTICS & RECENT BOOKINGS
 * Fetches booking counts and recent activity for the profile dashboard.
 */
export const getUserProfileStats = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Fetching profile stats for User ID:", userId);

    if (userId === "ffffffffffffffffffffffff") {
      return res.status(200).json({
        user: {
          _id: "ffffffffffffffffffffffff",
          name: "PropZo Admin",
          email: process.env.ADMIN_EMAIL || "admin@gmail.com",
          role: "admin",
          createdAt: new Date().toISOString()
        },
        stats: {
          totalBooked: 0, buyCount: 0, rentCount: 0, preRentCount: 0, sellCount: 0
        },
        recentActivity: [],
        recentSells: []
      });
    }

    // 1. Fetch User (excluding password)
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch Buy & Rent Bookings (from standard Booking model)
    const allStandardBookings = await Booking.find({ email: user.email })
      .populate("propertyId");

    let buyCount = 0;
    let rentApptCount = 0; // standard appointment-based rent

    allStandardBookings.forEach(b => {
      if (b.propertyId) {
        if (b.propertyId.category === "Buy") buyCount++;
        else if (b.propertyId.category === "Rent") rentApptCount++;
      }
    });

    // 3. Fetch RentalBookings (New model)
    const rentalBookings = await RentalBooking.find({ email: user.email });
    const rentFullCount = rentalBookings.length;

    // 4. Fetch PreRent Bookings
    const preRentCount = await PreRentBooking.countDocuments({
      "tenant.email": user.email,
    });

    // Fetch user created properties to represent Sell count
    const sellCount = await SaleProperty.countDocuments({ createdBy: userId });

    // 5. Fetch Recent Bookings (Combined from all sources)
    // Standard Bookings
    let recentStandard = await Booking.find({ email: user.email })
      .populate("propertyId")
      .sort({ createdAt: -1 })
      .limit(10);

    recentStandard = recentStandard.map((b) => {
      const doc = b.toObject();
      doc.property = doc.propertyId; // Normalize to .property
      return doc;
    });

    // Rental Bookings
    let recentRentals = await RentalBooking.find({ email: user.email })
      .populate("propertyId")
      .sort({ createdAt: -1 })
      .limit(10);

    recentRentals = recentRentals.map((b) => {
      const doc = b.toObject();
      doc.property = doc.propertyId; // Normalize to .property
      return doc;
    });

    // PreRent Bookings
    let recentPreRent = await PreRentBooking.find({ "tenant.email": user.email })
      .populate("property")
      .sort({ createdAt: -1 })
      .limit(10);

    // Combine and sort by date
    const combinedRecent = [...recentStandard, ...recentRentals, ...recentPreRent]
      .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
      .slice(0, 5);

    // 6. Fetch Recent Sell Properties
    let recentSells = await SaleProperty.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      user,
      stats: {
        totalBooked: buyCount + rentApptCount + rentFullCount + preRentCount + sellCount,
        buyCount,
        rentCount: rentApptCount + rentFullCount,
        preRentCount,
        sellCount
      },
      recentActivity: combinedRecent,
      recentSells
    });
  } catch (error) {
    console.error("Profile Stats Error:", error);
    res.status(500).json({ message: "Error fetching profile statistics" });
  }
};

/**
 * GET ALL USER BOOKINGS (Unified)
 * Aggregates Buy, Rent, and PreRent bookings for the My Bookings page.
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Fetching ALL bookings for User ID:", userId);

    if (userId === "ffffffffffffffffffffffff") {
      return res.status(200).json([]);
    }

    // 1. Fetch User (to get email)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch Standard Buy/Rent Bookings
    let bookings = await Booking.find({ email: user.email })
      .populate("propertyId")
      .sort({ createdAt: -1 });

    // Map `propertyId` to `property` for normalization
    bookings = bookings.map((b) => {
      const doc = b.toObject();
      doc.property = doc.propertyId;
      return doc;
    });

    // 3. Fetch RentalBookings (New model)
    let rentalBookings = await RentalBooking.find({ email: user.email })
      .populate("propertyId")
      .sort({ createdAt: -1 });

    rentalBookings = rentalBookings.map((b) => {
      const doc = b.toObject();
      doc.property = doc.propertyId; // Normalize to .property
      return doc;
    });

    // 4. Fetch PreRent Bookings
    const preRentBookings = await PreRentBooking.find({ "tenant.email": user.email })
      .populate("property")
      .sort({ createdAt: -1 });

    // 5. Combine and Sort all activities by date
    const allBookings = [...bookings, ...rentalBookings, ...preRentBookings]
      .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate));

    res.status(200).json(allBookings);
  } catch (error) {
    console.error("Fetch User Bookings Error:", error);
    res.status(500).json({ message: "Error fetching user bookings" });
  }
};

/**
 * UPDATE USER PROFILE
 * Updates name, phone, address, and avatar.
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === "ffffffffffffffffffffffff") {
      return res.status(400).json({ message: "Cannot edit hardcoded admin profile from this portal." });
    }

    // Check authorization: only owner or admin
    if (req.user.role !== "admin" && req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const { name, phone, address, avatar, profileImage, notificationPreferences, appearancePreferences } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (avatar !== undefined) updates.avatar = avatar;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (notificationPreferences !== undefined) updates.notificationPreferences = notificationPreferences;
    if (appearancePreferences !== undefined) updates.appearancePreferences = appearancePreferences;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

/**
 * UPDATE USER PASSWORD
 * Verifies current password and updates to a new one.
 */
export const updateUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === "ffffffffffffffffffffffff") {
      return res.status(400).json({ message: "Admin password can only be changed via environment variables." });
    }

    // Check authorization
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new passwords" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const bcrypt = await import("bcryptjs").then((m) => m.default);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ message: "Error updating password" });
  }
};
