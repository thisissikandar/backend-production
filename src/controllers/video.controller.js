import mongoose, { isValidObjectId } from "mongoose";

import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { Video } from "../models/video.model.js";
import { ApiResponseHaandler } from "../utils/ApiResponsHandler.js";
import { getMongoosePaginationOptions } from "../utils/helper.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const videoAggregation = Video.aggregate([
    {
      $match: {
        owner: req.user?._id,
        title: { $regex: query || "", $options: "i" },
      },
    },
    {
      $sort: {
        [sortBy || "createdAt"]: sortType === "desc" ? -1 : 1,
      },
    },
  ]);

  const videos = await Video.aggregatePaginate(
    videoAggregation,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalVideos",
        docs: "videos",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponseHaandler(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiErrorHandler(400, "Title and description are required");
  }
  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    throw new ApiErrorHandler(400, "Video file and thumbnail are required");
  }
  const videoFileLocalPath = req.files.videoFile[0].path;
  const thumbnailLoalpath = req.files.thumbnail[0].path;
  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLoalpath);
  const createdVideo = await Video.create({
    title,
    description,
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url,
    duration: videoFile?.duration,
    owner: req.user?._id,
  });
  return res
    .status(201)
    .json(
      new ApiResponseHaandler(201, createdVideo, "Video published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findOne({ _id: videoId, owner: req.user?._id });
  return res
    .status(200)
    .json(new ApiResponseHaandler(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const video = await Video.findOne({ _id: videoId, owner: req.user?._id });
  if (!video) {
    throw new ApiErrorHandler(404, "Video not found");
  }
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiErrorHandler(400, "Title and description are required");
  }
  video.title = title;
  video.description = description;
  if (req.files && req.files.thumbnail) {
    const thumbnailLocalPath = req.files.thumbnail[0].path;
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    video.thumbnail = thumbnail?.url;
  }
  await video.save();
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(200, video, "Video details updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  const deleteVideo = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user?._id,
  });
  if (!deleteVideo) {
    throw new ApiErrorHandler(404, "Video not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(200, deleteVideo, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiErrorHandler(400, "Invalid video ID");
  }
  const video = await Video.findOne({ _id: videoId, owner: req.user?._id });
  if (!video) {
    throw new ApiErrorHandler(404, "Video not found");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(
        200,
        video,
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
