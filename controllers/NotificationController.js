import Notification from "../models/Notification.js";

const getNotifications = async (req, res) => {
  try {
    const { userId } = req;
    const notifications = await Notification.find({
      to: userId,
      from: { $ne: userId },
    })
      .populate("from", { password: 0 })
      .sort({
        createdAt: "desc",
      })
      .exec();

    return res.json({
      success: true,
      notifications,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong,please try again",
    });
  }
};

const markRead = async (req, res) => {
  try {
    const { userId } = req;
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(404).json({
        success: false,
        read: false,
        error: "couldn't mark this notification as read",
      });
    }
    const notification = await Notification.find({
      _id: notificationId,
      to: userId,
    });
    if (!notification) {
      return res.status(404).json({
        success: false,
        read: false,
        error: "couldn't mark this notification as read",
      });
    }
    notification.read = true;

    const savedNotification = await notification.saved();
    if (!savedNotification) {
      return res.status(500).json({
        success: false,
        read: false,
        error: "something went wrong,please try again",
      });
    }

    res.json({
      success: true,
      read: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      read: false,
      error: "something went wrong,please try again",
    });
  }
};

export default { getNotifications, markRead };
