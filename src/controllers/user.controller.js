import { asyncHandler } from "../utils/asynHandler.js";
import { ApiErrorHaandler } from "../utils/ApiErrorHandler.js";
import { ApiResponseHaandler } from "../utils/ApiResponsHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrorHaandler(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { username, email, password } = req.body;
  //  if (fullname) {
  //     throw new ApiErrorHaandler(400,"Fullname is required")
  //  }

  console.log("request", req.body);
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiErrorHaandler(400, "All fields are Required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiErrorHaandler(
      409,
      "User with Email or Username Already Exist"
    );
  }

  const user = await User.create({
    email,
    password,
    username,
  });

  console.log("User", user);
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log("Creatred user ::", createdUser);
  if (!createdUser) {
    throw new ApiErrorHaandler(500, "Somthing Went Wrong While Register User");
  }

  return res
    .status(201)
    .json(
      new ApiResponseHaandler(200, createdUser, "User Register Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    throw new ApiErrorHaandler(400, "email and password is required");
  }

  const user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    throw new ApiErrorHaandler(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiErrorHaandler(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponseHaandler(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponseHaandler(200, {}, "User logged Out"));
});

// refresh token request route for frontend
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incommingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incommingRefreshToken) {
      throw new ApiErrorHaandler(401, "Unauthorize request");
    }

    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOCKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiErrorHaandler("401", "Invalid Refresh Token");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiErrorHaandler(
        401,
        "Refresh Token has been already Used or expired"
      );
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponseHaandler(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "accessed Refresh Token"
        )
      );
  } catch (error) {
    throw new ApiErrorHaandler(401, error?.message || "Invalid Refresh Token");
  }
});
export { registerUser, loginUser, logOutUser, refreshAccessToken };
