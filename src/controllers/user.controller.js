import { asyncHandler } from "../utils/asynHandler.js";
import { ApiErrorHaandler } from "../utils/ApiErrorHandler.js";
import { ApiResponseHaandler } from "../utils/ApiResponsHandler.js";

import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;
  //  if (fullname) {
  //     throw new ApiErrorHaandler(400,"Fullname is required")
  //  }

  if (
    [email, fullname, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiErrorHaandler(400, "All fields are Required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiErrorHaandler(
      409,
      "User with Email or Username Already Exist"
    );
  }

 const avatarLocalPath = req.files?.avatar[0]?.path;
 const coverImageLocalPath = req.files?.coverImage[0]?.path;

 if (!avatarLocalPath) {
  throw new ApiErrorHaandler(400, "Avatar Image is Required")
 }

const avatar = await uploadOnCloudinary(avatarLocalPath);

 const coverImage = await uploadOnCloudinary(coverImageLocalPath);

 if(!avatar){
  throw new ApiErrorHaandler(400, "Avatar Is Required")
 }

 const user = User.create({
  fullname,
  avatar: avatar?.url,
  coverImage: coverImage?.url || "",
  email,
  password,
  username: username.toLowerCase()
 })

const createdUser = await User.findById(user._id).select(
  "-password -refreshTocken"
)

if (!createdUser) {
  throw new ApiErrorHaandler(500,"Somthing Went Wrong While Register User")
}

return res.status(200).json({
 new ApiResponseHaandler(200, createdUser, "UserRegister Successfully")
})

});

export { registerUser };
