import Notification from "../models/Notification.js";

/**
 * GET ALL NOTIFICATIONS FOR USER
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log(`🔔 Fetching notifications for user: ${userId}`);
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        console.log(`🔔 Found ${notifications.length} notifications.`);
        res.status(200).json(notifications);
    } catch (error) {
        console.error("🔔 Error fetching notifications:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * MARK NOTIFICATION AS READ
 */
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE NOTIFICATION
 */
export const deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
