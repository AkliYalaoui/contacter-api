import Like from "../models/Like.js";
import Post from "../models/Post.js";

const LikeUnLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Couldn't like this post",
      });
    }

    let like = await Like.findOneAndDelete({ userId, postId: id });
    if (like) {
      return res.json({
        success: true,
        unliked: true,
        liked: false,
      });
    }

    like = new Like({
      userId,
      postId: id,
    });

    const savedLike = await like.save();
    if (!savedLike) {
      return res.status(500).json({
        success: false,
        error: "something went wrong",
      });
    }

    return res.json({
      success: true,
      unliked: false,
      liked: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
};

const getLikeCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const count = await Like.where({ postId: id }).countDocuments();

    const liked = await Like.findOne({ userId, postId: id });
    res.json({
      success: true,
      countLikes: count,
      alreadyLiked : liked ? true : false
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "something went wrong",
    });
  }
};

export default { getLikeCount, LikeUnLike };
