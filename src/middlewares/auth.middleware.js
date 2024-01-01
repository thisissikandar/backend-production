import { User } from "../models/user.model.js";
import { ApiErrorHaandler } from "../utils/ApiErrorHandler.js";
import { asyncHandler } from "../utils/asynHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.repace("Bearer ", "");

    if (!token) {
      throw new ApiErrorHaandler(401, "Unauthorized Request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiErrorHaandler(401, "Invalid Access Token");
    }
    req.user = user;
    next();
    
  } catch (error) {
    throw new ApiErrorHaandler(401, error?.message || "Invalid Access Token");
  }
});
