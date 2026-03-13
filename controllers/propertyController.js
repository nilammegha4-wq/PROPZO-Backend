import Property from "../models/Property.js";
import SaleProperty from "../models/SaleProperty.js";
import History from "../models/history.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Agent from "../models/Agent.js";
import mongoose from "mongoose";

console.log("DEBUG: propertyController.js final check. Mongoose type:", typeof mongoose);

export const addProperty = async (req, res) => {
  try {
    const { title, price, category, rentDuration, owner, agent } = req.body;

    // Basic Validation
    if (!title) return res.status(400).json({ message: "Property title is required" });
    if (price === undefined || price === null || price === "") return res.status(400).json({ message: "Price is required" });
    if (!category) return res.status(400).json({ message: "Category (Buy/Rent/PerRent) is required" });

    // Category-based validation
    if (category === "Rent") {
      if (rentDuration !== "month") {
        return res.status(400).json({ message: "Rent must have month duration" });
      }
    }

    if (category === "PerRent" || category === "PreRent") {
      if (rentDuration && !["hour", "day", "week"].includes(rentDuration)) {
        return res.status(400).json({ message: "Invalid PerRent duration" });
      }
    }

    const property = await Property.create({
      ...req.body,
      createdBy: req.user._id,
      agent: agent || null,
      owner: owner || req.user._id
    });

    // Notify all users except the creator
    try {
      const users = await User.find({ _id: { $ne: req.user._id } });

      if (users.length > 0) {
        const notifications = users.map(user => ({
          userId: user._id,
          title: "New Property Available! 🏠",
          message: `A new property "${property.title || 'Managed Property'}" has been added in ${property.city || property.address || 'your area'}.`,
          link: `/property/${property._id}`,
          type: "property_added"
        }));

        await Notification.insertMany(notifications);
      }
    } catch (notifError) {
      console.error("Failed to insert notifications:", notifError);
    }

    res.status(201).json(property);
  } catch (error) {
    console.error("Add Property Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const formatField = (val, defaultVal) => {
  if (!val || val === "N/A" || String(val).trim() === "" || val === "null") return defaultVal;
  return val;
};

// Helper to normalize Agent data consistently
const normalizeAgent = (agent) => {
  if (!agent) return null;

  // If agent is a string (ID)
  if (typeof agent === 'string') return null;

  // If agent is an ObjectId instance or object that looks like one but not a full agent
  if (agent._id && !agent.fullName && !agent.name && Object.keys(agent).length <= 2) return null;

  try {
    const obj = typeof agent.toObject === 'function' ? agent.toObject() : agent;

    // Final check if populated
    if (!obj.fullName && !obj.name) return null;

    return {
      ...obj,
      name: obj.fullName || obj.name || "PropZo Advisor",
      image: obj.image || ""
    };
  } catch (e) {
    console.error("normalizeAgent error:", e);
    return null;
  }
};

// Helper to normalize Owner data consistently
const getNormalizedOwner = (owner, sellerName, phone, email, isSale = false) => {
  const adminEmail = "prpzoestate@gmail.com";

  // If the owner is already fully populated object from the database
  if (owner && typeof owner === 'object' && owner.name) {
    // If the email is one of the administrative ones, normalize it based on category
    if (owner.email === "admin@propzo.com" || owner.email === "support@propzo.com" || owner.email === "prpzoestate@gmail.com") {
      return {
        ...owner,
        name: "Admin",
        phone: "+91 98765 43210",
        email: adminEmail,
        profileImage: owner.profileImage || ""
      };
    }
    return owner;
  }

  // Fallback for platform-managed properties
  return {
    name: sellerName || "Admin",
    phone: phone || "+91 98765 43210",
    email: (email && email !== "support@propzo.com" && email !== "admin@propzo.com" && email !== "prpzoestate@gmail.com") ? email : adminEmail,
    rating: 4.8,
    totalListings: 10,
    profileImage: ""
  };
};

export const getProperties = async (req, res) => {
  try {
    console.log("INSIDE getProperties. mongoose type:", typeof mongoose);
    // Fetch from both collections
    const [properties, saleProperties] = await Promise.all([
      Property.find().populate("owner", "name email phone profileImage").populate("agent").sort({ createdAt: -1 }),
      SaleProperty.find().populate("owner", "name email phone profileImage").populate("agent").sort({ createdAt: -1 })
    ]);

    // Map SaleProperties to match Property structure if needed, and ensure propertyType exists
    const mappedSaleProperties = saleProperties.map(p => {
      const obj = p.toObject();
      const priceStr = obj.price >= 10000000
        ? `₹${(obj.price / 10000000).toFixed(2)} Cr`
        : obj.price >= 100000
          ? `₹${(obj.price / 100000).toFixed(2)} Lakhs`
          : `₹${obj.price}`;

      return {
        ...obj,
        // ✅ Normalize for Frontend
        propertyType: obj.propertyType || (obj.category?.toLowerCase() === "sale" ? "Buy" : obj.category),
        displayPrice: obj.displayPrice || priceStr,
        image: obj.image || (obj.images && obj.images.length > 0 ? obj.images[0] : ""),

        beds: formatField(obj.beds || obj.bhk, 2),
        baths: formatField(obj.baths || obj.bathrooms, 2),
        furnished: formatField(obj.furnished || obj.furnishing || obj.furnishingStatus, "Semi-Furnished"),
        floor: formatField(obj.floor || obj.floorNumber, "Ground"),
        age: formatField(obj.age || obj.propertyAge, "New"),
        size: formatField(obj.size || obj.area, "1200 sqft"),
        area: formatField(obj.area || obj.size, "1200 sqft"),
        balconies: formatField(obj.balconies, 1),
        parking: formatField(obj.parking, "Covered"),
        facing: formatField(obj.facing, "East"),
        availableFrom: formatField(obj.availableFrom, "Immediately"),
        rentDuration: formatField(obj.rentDuration, "11 Months"),

        // ✅ Normalize Owner
        owner: getNormalizedOwner(obj.owner, obj.sellerName, obj.phone, obj.email, true),

        // ✅ Normalize Agent
        agent: normalizeAgent(obj.agent),

        _model: "SaleProperty"
      };
    });

    const mappedProperties = properties.map(p => {
      const obj = p.toObject();
      const priceStr = obj.price >= 10000000
        ? `₹${(obj.price / 10000000).toFixed(2)} Cr`
        : obj.price >= 100000
          ? `₹${(obj.price / 100000).toFixed(2)} Lakhs`
          : `₹${obj.price}`;

      return {
        ...obj,
        // ✅ Normalize for Frontend
        propertyType: obj.propertyType || obj.category,
        displayPrice: obj.displayPrice || priceStr,
        image: obj.image || (obj.images && obj.images.length > 0 ? obj.images[0] : ""),

        beds: formatField(obj.beds || obj.bhk, 2),
        baths: formatField(obj.baths || obj.bathrooms, 2),
        furnished: formatField(obj.furnished || obj.furnishing || obj.furnishingStatus, "Semi-Furnished"),
        floor: formatField(obj.floor || obj.floorNumber, "Ground"),
        age: formatField(obj.age || obj.propertyAge, "New"),
        size: formatField(obj.size || obj.area, "1200 sqft"),
        area: formatField(obj.area || obj.size, "1200 sqft"),
        balconies: formatField(obj.balconies, 1),
        parking: formatField(obj.parking, "Covered"),
        facing: formatField(obj.facing, "East"),
        availableFrom: formatField(obj.availableFrom, "Immediately"),
        rentDuration: formatField(obj.rentDuration, "11 Months"),

        owner: getNormalizedOwner(obj.owner, obj.sellerName, obj.phone, obj.email, false),

        // ✅ Normalize Agent
        agent: normalizeAgent(obj.agent),

        _model: "Property"
      };
    });

    // Merge and sort by createdAt
    const allProperties = [...mappedProperties, ...mappedSaleProperties].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allProperties);
  } catch (error) {
    console.error("Error in getProperties:", error.stack || error);
    res.status(500).json({ message: error.message });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    let isSale = false;
    let property = await Property.findById(req.params.id).populate("owner", "name email phone profileImage").populate("agent");

    if (!property) {
      property = await SaleProperty.findById(req.params.id).populate("owner", "name email phone profileImage").populate("agent");
      isSale = true;
    }

    if (!property) return res.status(404).json({ message: "Property not found" });

    const obj = property.toObject();
    const priceStr = obj.price >= 10000000
      ? `₹${(obj.price / 10000000).toFixed(2)} Cr`
      : obj.price >= 100000
        ? `₹${(obj.price / 100000).toFixed(2)} Lakhs`
        : `₹${obj.price}`;

    const result = {
      ...obj,
      propertyType: obj.propertyType || (obj.category?.toLowerCase() === "sale" ? "Buy" : obj.category),
      displayPrice: obj.displayPrice || priceStr,
      image: obj.image || (obj.images && obj.images.length > 0 ? obj.images[0] : ""),

      // ✅ Normalize for Frontend
      beds: formatField(obj.beds || obj.bhk, 2),
      baths: formatField(obj.baths || obj.bathrooms, 2),
      furnished: formatField(obj.furnished || obj.furnishing || obj.furnishingStatus, "Semi-Furnished"),
      floor: formatField(obj.floor || obj.floorNumber, "Ground"),
      age: formatField(obj.age || obj.propertyAge, "New"),
      size: formatField(obj.size || obj.area, "1200 sqft"),
      area: formatField(obj.area || obj.size, "1200 sqft"),
      balconies: formatField(obj.balconies, 1),
      parking: formatField(obj.parking, "Covered"),
      facing: formatField(obj.facing, "East"),
      availableFrom: formatField(obj.availableFrom, "Immediately"),
      rentDuration: formatField(obj.rentDuration, "11 Months"),

      owner: getNormalizedOwner(obj.owner, obj.sellerName, obj.phone, obj.email, isSale),

      // ✅ Normalize Agent
      agent: normalizeAgent(obj.agent)
    };
    res.json(result);
  } catch (error) {
    console.error("Error in getPropertyById:", error.stack || error);
    res.status(500).json({ message: error.message });
  }
};


export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // First try finding in SaleProperty
    let property = await SaleProperty.findById(id);
    let isSaleProperty = true;

    if (!property) {
      property = await Property.findById(id);
      isSaleProperty = false;
    }

    if (!property) return res.status(404).json({ message: "Property not found" });

    // Authorization: Admin can delete anything. If not admin, verify ownership.
    if (req.user.role !== 'admin') {
      const creatorId = property.createdBy || property.user; // Depends on model
      if (!creatorId || creatorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this property" });
      }
    }

    if (isSaleProperty) {
      await SaleProperty.findByIdAndDelete(id);
    } else {
      await Property.findByIdAndDelete(id);
    }

    res.json({ message: "Property deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const buyProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);
  property.isSold = true;
  await property.save();

  await History.create({
    user: req.user.id,
    property: property._id,
    action: "buy"
  });

  res.json("Property purchased");
};

export const contactAgent = async (req, res) => {
  await History.create({
    user: req.user.id,
    property: req.params.id,
    action: "contact_agent"
  });

  res.json("Agent contacted");
};

export const getPropertiesByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId || !mongoose.Types.ObjectId.isValid(agentId)) {
      console.error("Invalid agentId provided:", agentId);
      return res.status(400).json({ message: "Invalid Agent ID" });
    }

    // Fetch from both collections
    const [properties, saleProperties] = await Promise.all([
      Property.find({ agent: agentId }).populate("owner", "name email phone").populate("agent").sort({ createdAt: -1 }),
      SaleProperty.find({ agent: agentId }).populate("owner", "name email phone").populate("agent").sort({ createdAt: -1 })
    ]);

    // Format properties (using same normalization as getProperties)
    const normalize = (p, modelName) => {
      if (!p) return null;
      try {
        const obj = p.toObject();
        const priceStr = obj.price >= 10000000
          ? `₹${(obj.price / 10000000).toFixed(2)} Cr`
          : obj.price >= 100000
            ? `₹${(obj.price / 100000).toFixed(2)} Lakhs`
            : `₹${obj.price}`;

        return {
          ...obj,
          propertyType: obj.propertyType || (obj.category?.toLowerCase() === "sale" ? "Buy" : obj.category),
          displayPrice: obj.displayPrice || priceStr,
          image: obj.image || (obj.images && obj.images.length > 0 ? obj.images[0] : ""),
          beds: formatField(obj.beds || obj.bhk, 2),
          baths: formatField(obj.baths || obj.bathrooms, 2),
          furnished: formatField(obj.furnished || obj.furnishing || obj.furnishingStatus, "Semi-Furnished"),
          floor: formatField(obj.floor || obj.floorNumber, "Ground"),
          age: formatField(obj.age || obj.propertyAge, "New"),
          size: formatField(obj.size || obj.area, "1200 sqft"),
          area: formatField(obj.area || obj.size, "1200 sqft"),
          balconies: formatField(obj.balconies, 1),
          parking: formatField(obj.parking, "Covered"),
          facing: formatField(obj.facing, "East"),
          availableFrom: formatField(obj.availableFrom, "Immediately"),
          rentDuration: formatField(obj.rentDuration, "11 Months"),
          owner: getNormalizedOwner(obj.owner, obj.sellerName, obj.phone, obj.email),
          agent: normalizeAgent(obj.agent),
          _model: modelName
        };
      } catch (err) {
        console.error(`Error normalizing property ${p._id}:`, err);
        return null;
      }
    };

    const formattedProperties = [
      ...properties.map(p => normalize(p, "Property")),
      ...saleProperties.map(p => normalize(p, "SaleProperty"))
    ].filter(p => p !== null).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(formattedProperties);
  } catch (error) {
    console.error("Critical Error in getPropertiesByAgent:", error.stack || error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent } = req.body;

    let property = await Property.findById(id);
    let model = Property;

    if (!property) {
      property = await SaleProperty.findById(id);
      model = SaleProperty;
    }

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const updatedProperty = await model.findByIdAndUpdate(
      id,
      { ...req.body, agent: agent || null },
      { new: true, runValidators: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    console.error("Update Property Error:", error);
    res.status(500).json({ message: error.message });
  }
};
export const getPropertyStats = async (req, res) => {
  try {
    const buyQuery = { $or: [{ category: "Buy" }, { propertyType: "Buy" }, { category: "sale" }] };
    const rentQuery = { $or: [{ category: "Rent" }, { propertyType: "Rent" }] };
    const preRentQuery = { $or: [{ category: "PerRent" }, { category: "PreRent" }, { propertyType: "PerRent" }, { propertyType: "PreRent" }] };

    const [buyCountP, buyCountS, rentCountP, rentCountS, preRentCountP, preRentCountS] = await Promise.all([
      Property.countDocuments(buyQuery),
      SaleProperty.countDocuments(buyQuery),
      Property.countDocuments(rentQuery),
      SaleProperty.countDocuments(rentQuery),
      Property.countDocuments(preRentQuery),
      SaleProperty.countDocuments(preRentQuery)
    ]);

    res.json({
      buy: buyCountP + buyCountS,
      rent: rentCountP + rentCountS,
      preRent: preRentCountP + preRentCountS
    });
  } catch (error) {
    console.error("Error in getPropertyStats:", error);
    res.status(500).json({ message: error.message });
  }
};
