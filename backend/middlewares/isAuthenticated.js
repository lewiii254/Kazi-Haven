import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("token...",token);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized user", success: false });
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({ message: "Invalid token", success: false });
    }
    req.id = decode.userId;
    next();
  } catch (err) {
    console.log(err);
  }
};

export default isAuthenticated;
