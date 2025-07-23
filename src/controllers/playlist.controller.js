import mongoose, { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.models.js";

import { asyncHandler } from "../utils/asynHandler.js";
import { ApiResponseHaandler } from "../utils/ApiResponsHandler.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  const playlist = await PlayList.create({
    name,
    description,
    owner: req.user._id,
  });
  return res
    .status(201)
    .json(
      new ApiResponseHaandler(201, playlist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  const userPlaylists = await PlayList.find({ owner: userId });
  if (!userPlaylists || userPlaylists.length === 0) {
    throw new ApiErrorHandler(404, "No playlists found for this user");
  }

  return res
    .status(200)
    .json(
      new ApiResponseHaandler(
        200,
        userPlaylists,
        "User playlists fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playListById = await PlayList.findById({ _id: playlistId });
  if (!playListById) {
    throw new ApiErrorHandler(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(
        200,
        playListById,
        "Playlist fetched successfully"
      )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const addedVideoToPlaylist = await PlayList.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { videos: videoId },
    { new: true, upsert: true }
  );
  if (!addedVideoToPlaylist) {
    throw new ApiErrorHandler(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(
        200,
        addedVideoToPlaylist,
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const updatedPlaylist = await PlayList.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $pull: { videos: videoId } },
    { new: true }
  );
  if (!updatedPlaylist) {
    throw new ApiErrorHandler(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(
        200,
        updatedPlaylist,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  const deletedPlaylist = await PlayList.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id,
  });
  if (!deletedPlaylist) {
    throw new ApiErrorHandler(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(
        200,
        deletedPlaylist,
        "Playlist deleted successfully"
      )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  const playlist = await PlayList.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { name, description },
    { new: true }
  );
  if (!playlist) {
    throw new ApiErrorHandler(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponseHaandler(200, playlist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
