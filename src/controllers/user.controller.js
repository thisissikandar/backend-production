import { asyncHandler } from "../utils/asynHandler.js";
import { ApiErrorHaandler } from "../utils/ApiErrorHandler.js";
import { ApiResponseHaandler } from "../utils/ApiResponsHandler.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";



const registerUser = asyncHandler(async (req, res) => {
     // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
  const { username, email, fullname, password } = req.body;
  //  if (fullname) {
  //     throw new ApiErrorHaandler(400,"Fullname is required")
  //  }

  console.log("request", req.body)
  if (
    [email, fullname, username, password].some((field) => field?.trim() === "")
  ) {
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
 //console.log(req.files);

 const avatarLocalPath = req.files?.avatar[0]?.path;
 //const coverImageLocalPath = req.files?.coverImage[0]?.path;

 let coverImageLocalPath;
 if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
     coverImageLocalPath = req.files.coverImage[0].path
 }
 
console.log("Avatar File ::", avatarLocalPath);
 if (!avatarLocalPath) {
     throw new ApiErrorHaandler(400, "Avatar file is required")
 }

 const avatar = await  uploadOnCloudinary(avatarLocalPath)
 const coverImage =  await uploadOnCloudinary(coverImageLocalPath)
console.log("Avatar ::", avatar)

 if (!avatar) {
     throw new ApiErrorHaandler(400, "Avatar file is required")
 }



  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
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

export { registerUser };
