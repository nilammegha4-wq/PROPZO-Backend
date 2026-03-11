import User from "../models/User.js";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import PreRentBooking from "../models/PreRentBooking.js";
import RentalBooking from "../models/RentalBooking.js"; // Added missing import
import Review from "../models/Review.js";

/**
 * GET ADMIN DASHBOARD DATA
 * Provides total counts for Users, Properties, Bookings, and unified recent activity.
 */
export const getAdminDashboardData = async (req, res) => {
    try {
        const [
            totalUsers,
            totalProperties,
            totalBuyAppointments, // Using Booking model for Buy visits
            totalRentAppointments, // Using RentalBooking model
            totalPreRentAppointments, // Using PreRentBooking model
            recentUsers,
            recentProperties,
            recentBookings,
            recentRentalBookings,
            recentPreRentBookings,
            pieDataStats
        ] = await Promise.all([
            User.countDocuments(),
            Property.countDocuments(),
            // Count Buy Appointments (Booking linked to Category: Buy)
            Booking.aggregate([
                {
                    $lookup: {
                        from: "properties",
                        localField: "propertyId",
                        foreignField: "_id",
                        as: "property"
                    }
                },
                { $unwind: "$property" },
                { $match: { "property.category": "Buy" } },
                { $count: "total" }
            ]),
            RentalBooking.countDocuments(),
            PreRentBooking.countDocuments(),
            // Sort by _id descending to get latest items if createdAt is missing
            User.find().sort({ _id: -1 }).limit(5).select("name email createdAt"),
            Property.find().sort({ _id: -1 }).limit(5).populate("createdBy", "name"),
            // Recent generic bookings (Buy/Rent/PerRent visits)
            Booking.find().sort({ _id: -1 }).limit(5).populate("propertyId", "title category price"),
            // Recent rental bookings
            RentalBooking.find().sort({ _id: -1 }).limit(5).populate("propertyId", "title category price"),
            // Recent pre-rent bookings
            PreRentBooking.find().sort({ _id: -1 }).limit(5).populate("property", "title category price"),
            // Property Distribution for Chart
            Property.aggregate([
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Extract counts from aggregation results
        const buyCount = totalBuyAppointments[0]?.total || 0;

        // Unify Recent Appointments for the frontend table
        const unifiedAppointments = [
            ...recentBookings.map(b => ({
                user: { name: b.name, email: b.email },
                property: b.propertyId,
                proposedDate: b.visitDate,
                proposedTime: b.visitTime,
                type: "Visit",
                status: "Pending",
                createdAt: b.createdAt
            })),
            ...recentRentalBookings.map(b => ({
                user: { name: b.name, email: b.email },
                property: b.propertyId,
                proposedDate: b.visitDate,
                proposedTime: b.visitTime,
                type: "Rental",
                status: "Pending",
                createdAt: b.createdAt
            })),
            ...recentPreRentBookings.map(b => ({
                user: { name: b.tenant?.fullName, email: b.tenant?.email },
                property: b.property,
                proposedDate: new Date(b.bookingDate).toLocaleDateString(),
                proposedTime: "N/A",
                type: "Pre-Rent",
                status: b.status,
                createdAt: b.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

        // Prepare pie chart data
        const pieData = pieDataStats.map(item => ({
            name: item._id || "Other",
            value: item.count
        }));

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProperties,
                totalBuyAppointments: buyCount,
                totalRentAppointments,
                totalPreRentAppointments,
                recentUsers,
                recentProperties,
                recentBookings: unifiedAppointments, // Return unified list
                pieData
            },
        });
    } catch (error) {
        console.error("Dashboard Aggregation Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
    }
};
