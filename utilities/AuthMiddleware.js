import jwt from "jsonwebtoken";

const AuthMiddleware = async (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied",
    });
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN);
    if (!verified) {
      return res.status(401).json({
        success: false,
        error: "Access denied",
      });
    }
    req.userId = verified.id;
    req.token = token;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({
      success: false,
      error: "Access denied",
    });
  }
};

export { AuthMiddleware };
