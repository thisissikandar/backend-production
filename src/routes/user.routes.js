import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  logOutUser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Secured Routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/update-account").post(verifyJWT, updateAccountDetails);
router.route("/update-avatar").post(verifyJWT,upload.single("avatar"), updateUserAvatar);
router.route("/update-cover-image").post(verifyJWT,upload.single("coverImage"), updateUserCoverImage);
router.route("/get-current-user").post(verifyJWT, getCurrentUser);
router.route("/change-current-password").post(verifyJWT, changeCurrentPassword);

export default router;
