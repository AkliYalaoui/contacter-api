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

const markAllRead = async (req, res) => {
  try {
    const { userId } = req;

    const result = await Notification.updateMany(
      { to: userId },
      { read: true }
    );

    res.json({
      success: true,
      msg: "all notifications are marked read",
      count: result.nModified,
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

export default { getNotifications, markAllRead };
