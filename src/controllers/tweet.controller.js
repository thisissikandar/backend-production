import mongoose, { isValidObjectId } from "mongoose";

import { asyncHandler } from "../utils/asynHandler.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { ApiResponseHaandler } from "../utils/ApiResponsHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiErrorHandler(400, "content is required");
  }
  const createdTweet = await Tweet.create({ content, owner: req.user?._id });
  return res
    .status(201)
    .json(
      new ApiResponseHaandler(201, createdTweet, "Tweet created successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const userTweet = await Tweet.find({
    owner: userId,
  });
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(
        200,
        userTweet,
        "User tweets fetched successfully"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const existingTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user?._id },
    { $set: { content: content } },
    {
      new: true,
    }
  );
  console.log("Updated tweet:", existingTweet);
  if (!existingTweet) {
    throw new ApiErrorHandler(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(200, existingTweet, "Tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const deleteTweet = await Tweet.findOneAndDelete(
    { _id: tweetId, owner: req.user?._id },
    {
      new: true,
    }
  );
  if (!deleteTweet) {
    throw new ApiErrorHandler(404, "Tweet not found ");
  }
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(200, deleteTweet, "Tweet Deleted successfully")
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
