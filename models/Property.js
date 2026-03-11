// // // // // // import mongoose from "mongoose";

// // // // // // const propertySchema = new mongoose.Schema(
// // // // // //   {
// // // // // //     title: String,
// // // // // //     location: String,
// // // // // //     city: String,
// // // // // //     price: Number,
// // // // // //     displayPrice: String,
// // // // // //     type: String,
// // // // // //     image: String,

// // // // // //     category: {
// // // // // //       type: String,
// // // // // //       enum: ["Buy", "Rent", "PerRent"],
// // // // // //       required: true,
// // // // // //     },

// // // // // //     rentDuration: {
// // // // // //       type: String,
// // // // // //       enum: ["hour", "day", "week", "month"],
// // // // // //       default: null,
// // // // // //     },
// // // // // //   },
// // // // // //   { timestamps: true }
// // // // // // );

// // // // // // export default mongoose.model("Property", propertySchema);


// // // // // // import mongoose from "mongoose";

// // // // // // const propertySchema = new mongoose.Schema(
// // // // // //   {
// // // // // //     title: String,
// // // // // //     image : String, // main image
// // // // // //     images : [String], // multiple images

// // // // // //     displayPrice: String,
// // // // // //     price: Number,

// // // // // //     location: String,
// // // // // //     address: String,
// // // // // //     city: String,

// // // // // //     propertyId: String,

// // // // // //     type: String, // Apartment | Villa | House

// // // // // //     beds: Number,
// // // // // //     baths: Number,
// // // // // //     size: String,

// // // // // //     phone: String,
// // // // // //     map: String,

// // // // // //     description: String,

// // // // // //     category: {
// // // // // //       type: String,
// // // // // //       enum: ["Buy", "Rent", "PerRent"],
// // // // // //       required: true,
// // // // // //     },

// // // // // //     rentDuration: {
// // // // // //       type: String,
// // // // // //       enum: ["hour", "day", "week", "month"],
// // // // // //       default: null,
// // // // // //     },

// // // // // //     isSold: {
// // // // // //       type: Boolean,
// // // // // //       default: false,
// // // // // //     },
// // // // // //   },
// // // // // //   { timestamps: true }
// // // // // // );

// // // // // // export default mongoose.model("Property", propertySchema);

// // // // // import mongoose from "mongoose";

// // // // // const propertySchema = new mongoose.Schema({
// // // // //   title: String,
// // // // //   location: String,
// // // // //   city: String,
// // // // //   price: Number,
// // // // //   category: {
// // // // //     type: String,
// // // // //     enum: ["Buy", "Rent", "PerRent"],
// // // // //   },

// // // // //   mapEmbed: String,
// // // // //   images: [String],

// // // // //   bedrooms: Number,
// // // // //   bathrooms: Number,
// // // // //   balconies: Number,
// // // // //   parking: String,
// // // // //   floor: String,
// // // // //   age: String,
// // // // //   area: String,
// // // // //   furnished: String,
// // // // //   facing: String,
// // // // //   availableFrom: String,
// // // // //   description: String,
// // // // //   amenities: [String],

// // // // //   owner: {
// // // // //     name: String,
// // // // //     phone: String,
// // // // //     email: String,
// // // // //     experience: String,
// // // // //     rating: Number,
// // // // //     totalListings: Number,
// // // // //   },
// // // // // }, { timestamps: true });

// // // // // export default mongoose.model("Property", propertySchema);


// // // // import mongoose from "mongoose";
// // // // const propertySchema = new mongoose.Schema(
// // // //   {
// // // //     title: String,
// // // //     location: String,
// // // //     address: String,          // added for Buy
// // // //     city: String,             // added if needed
// // // //     price: Number,
// // // //     category: String,
// // // //     mapEmbed: String,
// // // //     images: [String],

// // // //     // Buy fields
// // // //     beds: Number,             // added for Buy
// // // //     baths: Number,            // added for Buy
// // // //     size: String,             // added for Buy

// // // //     // Rent fields
// // // //     bedrooms: Number,
// // // //     bathrooms: Number,
// // // //     balconies: Number,
// // // //     parking: String,
// // // //     floor: String,
// // // //     age: String,
// // // //     area: String,
// // // //     furnished: String,
// // // //     facing: String,
// // // //     availableFrom: String,
// // // //     description: String,
// // // //     amenities: [String],

// // // //     owner: ownerSchema,
// // // //     reviews: [reviewSchema],
// // // //   },
// // // //   { timestamps: true }
// // // // );
// // // // export default mongoose.model("Property", propertySchema);


// // // import mongoose from "mongoose";

// // // const reviewSchema = new mongoose.Schema({
// // //   name: String,
// // //   rating: Number,
// // //   comment: String,
// // // });

// // // const ownerSchema = new mongoose.Schema({
// // //   name: String,
// // //   phone: String,
// // //   email: String,
// // //   experience: String,
// // //   rating: Number,
// // //   totalListings: Number,
// // // });

// // // const propertySchema = new mongoose.Schema(
// // //   {
// // //     title: String,
// // //     location: String,
// // //     address: String,          // ✅ Buy
// // //     propertyId: String,       // ✅ Buy
// // //     type: String,             // ✅ Buy
// // //     displayPrice: String,     // ✅ Buy
// // //     price: Number,
// // //     category: String,

// // //     mapEmbed: String,
// // //     map: String,              // ✅ Buy

// // //     image: String,            // ✅ Buy single image
// // //     images: [String],

// // //     // Buy specific
// // //     beds: Number,
// // //     baths: Number,
// // //     size: String,

// // //     // Rent specific
// // //     bedrooms: Number,
// // //     bathrooms: Number,
// // //     balconies: Number,
// // //     parking: String,
// // //     floor: String,
// // //     age: String,
// // //     area: String,
// // //     furnished: String,
// // //     facing: String,
// // //     availableFrom: String,

// // //     description: String,
// // //     amenities: [String],

// // //     owner: ownerSchema,
// // //     reviews: [reviewSchema],
// // //   },
// // //   { timestamps: true }
// // // );

// // // export default mongoose.model("Property", propertySchema);

// // import mongoose from "mongoose";

// // const reviewSchema = new mongoose.Schema({
// //   name: { type: String, required: true },
// //   rating: { type: Number, min: 1, max: 5 },
// //   comment: { type: String },
// // });

// // const ownerSchema = new mongoose.Schema({
// //   name: { type: String },
// //   phone: { type: String },
// //   email: { type: String },
// //   experience: { type: String },
// //   rating: { type: Number, default: 0 },
// //   totalListings: { type: Number, default: 0 },
// // });

// // const propertySchema = new mongoose.Schema(
// //   {
// //     title: { type: String, required: true },
// //     location: { type: String, required: true },

// //     address: String,      // Buy
// //     propertyId: String,   // Buy
// //     type: String,         // Buy
// //     displayPrice: String, // Buy

// //     price: { type: Number, required: true },

// //     category: {
// //       type: String,
// //       enum: ["Buy", "Rent", "PerRent"],
// //       required: true,
// //     },

// //     rentDuration: {
// //       type: String,
// //       enum: ["hour", "day", "week", "month"],
// //       required: function () {
// //         return this.category === "Rent" || this.category === "PerRent";
// //       },
// //     },

// //     mapEmbed: String,
// //     map: String,

// //     image: String,
// //     images: [String],

// //     // Buy specific
// //     beds: Number,
// //     baths: Number,
// //     size: String,

// //     // Rent specific
// //     bedrooms: Number,
// //     bathrooms: Number,
// //     balconies: Number,
// //     parking: String,
// //     floor: String,
// //     age: String,
// //     area: String,
// //     furnished: String,
// //     facing: String,
// //     availableFrom: String,

// //     description: String,
// //     amenities: [String],

// //     owner: {
// //       type: ownerSchema,
// //       required: function () {
// //         return this.category === "Rent" || this.category === "PerRent";
// //       },
// //     },

// //     reviews: [reviewSchema],
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("Property", propertySchema);

// import mongoose from "mongoose";

// const reviewSchema = new mongoose.Schema({
//   name: String,
//   rating: Number,
//   comment: String,
// });

// const ownerSchema = new mongoose.Schema({
//   name: String,
//   phone: String,
//   email: String,
//   experience: String,
//   rating: Number,
//   totalListings: Number,
// });

// const propertySchema = new mongoose.Schema(
//   {
//     title: String,
//     location: String,
//           price: {
//             type: Number,
//             required: true,
//           },  
//         category: String,

//     // ✅ Duration field
//     rentDuration: String,

//     // Buy
//     address: String,
//     propertyId: String,
//     type: String,
//     displayPrice: String,
//     map: String,
//     image: String,
//     images: [String],
//     beds: Number,
//     baths: Number,
//     size: String,

//     // Rent / PerRent
//         beds: {
//         type: Number,
//         required: true,
//       },
//       baths: {
//         type: Number,
//         required: true,
//       },
//     balconies: Number,
//     parking: String,
//     floor: String,
//     age: String,
//     area: String,
//     furnished: String,
//     facing: String,
//     availableFrom: String,

//     description: String,
//     amenities: [String],

//     owner: ownerSchema,
//     reviews: [reviewSchema],
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Property", propertySchema);

import mongoose from "mongoose";

/* =========================
   Review Schema
========================= */
const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
});

/* =========================
   Owner Schema
========================= */
const ownerSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  experience: String,
  rating: {
    type: Number,
    default: 0,
  },
  totalListings: {
    type: Number,
    default: 0,
  },
});

/* =========================
   Property Schema
========================= */
const propertySchema = new mongoose.Schema(
  {
    /* Basic Info */
    title: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: String,
    city: String,
    state: String,
    pincode: String,

    price: {
      type: Number,
      required: true,
    },
    displayPrice: String,

    category: {
      type: String,
      required: true,
    },

    propertyType: {
      type: String,
      enum: ["Buy", "Rent", "PerRent"],
    },

    /* Duration (for Rent / PreRent) */
    rentDuration: {
      type: String,
      enum: ["hour", "day", "week", "month"],
    },

    /* Property Details */
    type: {
      type: String,
    },
    beds: {
      type: Number,
      required: true,
    },
    baths: {
      type: Number,
      required: true,
    },
    size: String,
    area: String,

    balconies: Number,
    parking: String,
    floorNumber: Number,
    totalFloors: Number,
    propertyAge: String,
    furnishingStatus: {
      type: String,
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
    },
    facing: String,
    availableFrom: String,

    /* Media */
    image: String,        // main image
    images: [String],     // multiple images
    map: String,
    mapEmbed: String,

    /* Extra Info */
    description: String,
    amenities: [String],

    /* Availability */
    isSold: {
      type: Boolean,
      default: false,
    },

    /* Relations */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null
    },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);