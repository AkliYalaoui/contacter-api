import Friend from "../models/Friend.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Notification from "../models/Notification.js";

const getSuggestions = async (req, res) => {
  try {
    const { userId } = req;
    //check for loggedUser and get his friend lists

    const loggedUser = await User.findById(userId).select("friends");
    if (!loggedUser) {
      return res.status(404).json({
        success: false,
        error: "Please logout and try again",
      });
    }

    //get the request sent or received by the logged user
    const requests = await Friend.find({
      $or: [{ requester: userId }, { recipient: userId }],
    }).select("recipient requester");

    //construct the forbidden friends suggestions
    let forbiddenSuggestions = new Set();
    requests.forEach((request) => {
      forbiddenSuggestions.add(request.recipient);
      forbiddenSuggestions.add(request.requester);
    });
    forbiddenSuggestions.add(userId);
    forbiddenSuggestions = [...forbiddenSuggestions];

    //create the suggestions
    const suggestions = await User.find(
      {
        $and: [
          { _id: { $nin: forbiddenSuggestions } },
          { _id: { $nin: loggedUser.friends } },
        ],
      },
      { password: 0 }
    );
    return res.json({
      success: true,
      suggestions,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to get the suggestions,please try again",
    });
  }
};
const getRequest = async (req, res) => {
  try {
    const { userId } = req;
    //get requests
    const requests = await Friend.find(
      { $and: [{ recipient: userId }, { status: 0 }] },
      { recipient: 0, status: 0 }
    )
      .populate("requester", "userName profilePhoto about")
      .sort({ createdAt: "desc" })
      .exec();
    return res.json({
      success: true,
      requests,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to get the requests,please try again",
    });
  }
};
const createRequest = async (req, res) => {
  try {
    const { userId } = req;
    const recipientId = req.body.id;

    //check if it is arleady a request
    let request = await Friend.findOne({
      $or: [
        { $and: [{ requester: userId }, { recipient: recipientId }] },
        { $and: [{ requester: recipientId }, { recipient: userId }] },
      ],
    });
    if (request) {
      return res.status(400).json({
        success: false,
        error: "You have already sent/received a request to/from that user ",
      });
    }
    //make the request
    request = new Friend({
      requester: userId,
      recipient: recipientId,
    });
    //save the request
    const savedRequest = await request.save();
    if (!savedRequest) {
      return res.status(500).json({
        success: false,
        error:
          "something went wrong while trying to send the request,please try again",
      });
    }
    request = await Friend.findById(savedRequest._id, {
      recipient: 0,
      status: 0,
    })
      .populate("requester", "userName profilePhoto about")
      .exec();

    return res.json({
      success: true,
      msg: "request sent successfully",
      request,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to send the request,please try again",
    });
  }
};
const deleteRequest = async (req, res) => {
  try {
    const requestId = req.body.id;
    const { userId } = req;
    //fetch and delete  the request
    const request = await Friend.deleteOne({
      _id: requestId,
      recipient: userId,
    });

    if (request.deleteCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Couldn't delete the request",
      });
    }

    return res.json({
      success: true,
      msg: "Request deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to accept the request,please try again",
    });
  }
};
const acceptRequest = async (req, res) => {
  try {
    const requestId = req.body.id;
    const { userId } = req;
    //update the status of the request
    const request = await Friend.findById(requestId);
    request.status = 1;
    const savedRequest = await request.save();
    if (!request) {
      return res.status(500).json({
        success: false,
        error:
          "something went wrong while trying to accept the request,please try again",
      });
    }

    //make the two users friends;
    const loggedUser = await User.findById(userId);
    loggedUser.friends.push(savedRequest.requester);

    const newFriend = await User.findById(savedRequest.requester);
    newFriend.friends.push(userId);

    const savedLoggedUser = await loggedUser.save();
    const savedNewFriend = await newFriend.save();

    const newConversation = new Conversation({
      member_a: userId,
      member_b: request.requester,
    });

    const savedNewConversation = await newConversation.save();

    const requestNotification = new Notification({
      type: "request",
      content: "Accepted your request",
      from: request.recipient,
      to: request.requester,
    });
    const savedRequestNotification = await requestNotification.save();
    if (
      savedRequest &&
      savedLoggedUser &&
      savedNewFriend &&
      savedNewConversation &&
      savedRequestNotification
    ) {
      return res.json({
        success: true,
        msg: "request accepted successfully",
      });
    }

    return res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to accept the request,please try again",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error:
        "something went wrong while trying to accept the request,please try again",
    });
  }
};

export default {
  getRequest,
  createRequest,
  deleteRequest,
  acceptRequest,
  getSuggestions,
};
