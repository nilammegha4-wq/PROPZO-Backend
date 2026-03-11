import Property from "../models/Property.js";
import SaleProperty from "../models/SaleProperty.js";
import Booking from "../models/Booking.js";
import RentalBooking from "../models/RentalBooking.js";
import PackageBooking from "../models/packagebooking.js";
import PremiumService from "../models/premiumservice.js"; // Added PremiumService
import User from "../models/User.js";
import Agent from "../models/Agent.js";
import PreRentBooking from "../models/PreRentBooking.js";

export const getAdminReportsData = async (req, res) => {
    console.log("📊 API Request: getAdminReportsData (V3 - Final)");
    try {
        // Use $in for category/status to handle naming discrepancies between models
        const [
            totalUsers,
            totalAgents,

            // Property Counts (Combined)
            totalPropsRegular,
            totalPropsSale,
            buyPropsRegular,
            buyPropsSale,
            rentPropsRegular,
            rentPropsSale,
            preRentPropsRegular,
            preRentPropsSale,

            // Booking Stats (Case-insensitive where possible)
            completedGeneral,
            pendingGeneral,
            cancelledGeneral,

            completedRental,
            pendingRental,
            cancelledRental,

            completedPreRent,
            pendingPreRent,
            failedPreRent,

            approvedPackages,
            pendingPackages,
            rejectedPackages,

            totalPremiumServices,

            // Revenue Data
            revenueData,

            // Monthly Aggregations (Combined)
            monthlyGeneral,
            monthlyRental,
            monthlyPreRent,

            // Recent Transactions
            recentGeneral,
            recentRental,
            recentPreRent,
            recentPremium,

            // Latest Properties for Management
            recentGeneralProps,
            recentSaleProps
        ] = await Promise.all([
            User.countDocuments(),
            Agent.countDocuments(),

            // Properties
            Property.countDocuments(),
            SaleProperty.countDocuments(),
            Property.countDocuments({ category: { $in: ["Buy", "Sell", "Sale"] } }),
            SaleProperty.countDocuments({ category: { $in: ["Buy", "Sell", "Sale"] } }),
            Property.countDocuments({ category: "Rent" }),
            SaleProperty.countDocuments({ category: "Rent" }),
            Property.countDocuments({ category: { $in: ["PerRent", "PreRent"] } }),
            SaleProperty.countDocuments({ category: { $in: ["PerRent", "PreRent"] } }),

            // Booking Statuses (Aggregated)
            Booking.countDocuments({ status: { $in: ["completed", "Completed", "Confirmed"] } }),
            Booking.countDocuments({ status: { $in: ["pending", "Pending"] } }),
            Booking.countDocuments({ status: { $in: ["cancelled", "Cancelled", "Failed"] } }),

            RentalBooking.countDocuments({ status: { $in: ["completed", "Completed"] } }),
            RentalBooking.countDocuments({ status: { $in: ["pending", "Pending"] } }),
            RentalBooking.countDocuments({ status: { $in: ["cancelled", "Cancelled"] } }),

            PreRentBooking.countDocuments({ status: "Completed" }),
            PreRentBooking.countDocuments({ status: "Pending" }),
            PreRentBooking.countDocuments({ status: "Failed" }),

            PackageBooking.countDocuments({ status: "Approved" }),
            PackageBooking.countDocuments({ status: "Pending" }),
            PackageBooking.countDocuments({ status: "Rejected" }),

            PremiumService.countDocuments(),

            // Revenue (Total from all payment-enabled models)
            PreRentBooking.aggregate([
                { $match: { status: "Completed" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),

            // Monthly Grouping
            Booking.aggregate([{ $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }]),
            RentalBooking.aggregate([{ $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }]),
            PreRentBooking.aggregate([{ $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }]),

            // Latest Transactions & Properties
            Booking.find().populate("propertyId").sort({ createdAt: -1 }).limit(5),
            RentalBooking.find().populate("propertyId").sort({ createdAt: -1 }).limit(5),
            PreRentBooking.find().populate("property").sort({ createdAt: -1 }).limit(5),
            PremiumService.find().sort({ createdAt: -1 }).limit(5),

            // Latest Properties for Management
            Property.find().sort({ createdAt: -1 }).limit(5),
            SaleProperty.find().sort({ createdAt: -1 }).limit(5)
        ]);

        // Totals
        const totalProperties = totalPropsRegular + totalPropsSale;
        const totalBuyProperties = buyPropsRegular + buyPropsSale;
        const totalRentProperties = rentPropsRegular + rentPropsSale;
        const totalPreRentProperties = preRentPropsRegular + preRentPropsSale;

        const completedBookings = completedGeneral + completedRental + completedPreRent + approvedPackages;
        const pendingBookings = pendingGeneral + pendingRental + pendingPreRent + pendingPackages + totalPremiumServices;
        const cancelledBookings = cancelledGeneral + cancelledRental + failedPreRent + rejectedPackages;

        const totalBookings = completedBookings + pendingBookings + cancelledBookings;
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Chart Data Format
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyMap = {};
        [monthlyGeneral, monthlyRental, monthlyPreRent].forEach(list => {
            list.forEach(item => {
                if (item._id) {
                    const mName = monthNames[item._id - 1];
                    monthlyMap[mName] = (monthlyMap[mName] || 0) + item.count;
                }
            });
        });
        const formattedMonthlyReports = Object.keys(monthlyMap).map(m => ({ month: m, total: monthlyMap[m] }));

        // Transaction Table Format
        const transactions = [
            ...recentGeneral.map(t => ({
                id: t._id,
                type: "general", // Added type
                user: t.name,
                property: t.propertyId?.title || "Property Visit",
                date: new Date(t.createdAt).toLocaleDateString(),
                amount: t.propertyId?.price || 0,
                status: t.status || "Visit Scheduled"
            })),
            ...recentRental.map(t => ({
                id: t._id,
                type: "rental", // Added type
                user: t.name,
                property: t.propertyId?.title || "Rental Inquiry",
                date: new Date(t.createdAt).toLocaleDateString(),
                amount: 0,
                status: t.status || "Pending"
            })),
            ...recentPreRent.map(t => ({
                id: t._id,
                type: "prerent", // Added type
                user: t.tenant?.fullName || t.name,
                property: t.property?.title || "Premium Rental",
                date: new Date(t.createdAt).toLocaleDateString(),
                amount: t.amount,
                status: t.status
            })),
            ...recentPremium.map(t => ({
                id: t._id,
                type: "premium", // Added type
                user: t.name,
                property: t.packageName || "Premium Service",
                date: new Date(t.createdAt).toLocaleDateString(),
                amount: 0,
                status: t.status
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        console.log(`✅ Success: Aggregated ${totalProperties} props and ${totalBookings} bookings.`);

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalAgents,
                totalProperties,
                totalBuyProperties,
                totalRentProperties,
                totalPreRentProperties,
                totalBookings,
                completedBookings,
                pendingBookings,
                cancelledBookings,
                totalRevenue,
                revenue: formattedMonthlyReports.length > 0 ? formattedMonthlyReports : monthNames.slice(0, 3).map(m => ({ month: m, total: 0 })),
                bookings: transactions,
                properties: [
                    ...recentGeneralProps.map(p => ({
                        id: p._id,
                        type: "property",
                        name: p.title,
                        category: p.category,
                        price: p.price,
                        units: "Regular Listing",
                        status: p.isSold ? "Sold" : "Available"
                    })),
                    ...recentSaleProps.map(p => ({
                        id: p._id,
                        type: "property",
                        name: p.title,
                        category: p.category || "Sale",
                        price: p.price,
                        units: "Sale Listing",
                        status: p.isSold ? "Sold" : "Available"
                    }))
                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
                // Add a flag to tell the frontend delete is supported
                allowDelete: true
            },
        });
    } catch (error) {
        console.error("❌ Error in getAdminReportsData:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// New function to delete report data (bookings/transactions)
export const deleteReportData = async (req, res) => {
    const { id, type } = req.params;
    console.log(`🗑️ Deleting ${type} record: ${id}`);

    try {
        let result = null;
        switch (type) {
            case "general":
                result = await Booking.findByIdAndDelete(id);
                break;
            case "rental":
                result = await RentalBooking.findByIdAndDelete(id);
                break;
            case "prerent":
                result = await PreRentBooking.findByIdAndDelete(id);
                break;
            case "premium":
                result = await PremiumService.findByIdAndDelete(id);
                break;
            case "property":
                // Try Regular Property first
                result = await Property.findByIdAndDelete(id);
                if (!result) {
                    // Then try SaleProperty
                    result = await SaleProperty.findByIdAndDelete(id);
                }
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid record type" });
        }

        if (!result) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        return res.status(200).json({ success: true, message: "Record deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting report data:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
