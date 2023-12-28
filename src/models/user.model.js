import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    password: {
      type: String,
      required: [true, "Password is Reyuired"],
    },
    refreshTocken: {
      type: String,
      required: true,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  //please avoid arrow function  here
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccesToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: _id,
    },
    process.env.REFRESH_TOCKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOCKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
