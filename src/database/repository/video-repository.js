const Video = require('../../models/Video');
const Section = require('../../models/Section');

// ** Add a new video to a section **
const addVideoToSection = async ({ section_id, video_id, video_url, video_duration, is_locked, is_previewable }) => {
  const section = await Section.findOne({ section_id });
  if (!section) throw new Error('Section not found');

  const newVideo = new Video({
    section_id: section._id,
    video_id,
    video_url,
    video_duration,
    is_locked,
    is_previewable,
  });

  await newVideo.save();
  return newVideo;
};

// ** Get all videos for a specific section **
const getVideosBySectionId = async (section_id) => {
  const section = await Section.findOne({ section_id });
  if (!section) throw new Error('Section not found');

  return Video.find({ section_id: section._id });
};

// ** Get a specific video by its video_id and section_id **
const getVideoById = async (section_id, video_id) => {
  const section = await Section.findOne({ section_id });
  if (!section) throw new Error('Section not found');

  const video = await Video.findOne({ section_id: section._id, video_id });
  if (!video) throw new Error('Video not found');

  return video;
};

// ** Update a video for a specific section **
const updateVideo = async (section_id, video_id, videoData) => {
  const section = await Section.findOne({ section_id });
  if (!section) throw new Error('Section not found');

  const updatedVideo = await Video.findOneAndUpdate(
    { section_id: section._id, video_id },
    videoData,
    { new: true }
  );

  if (!updatedVideo) throw new Error('Video not found');
  return updatedVideo;
};

// ** Delete a specific video **
const deleteVideo = async (section_id, video_id) => {
  const section = await Section.findOne({ section_id });
  if (!section) throw new Error('Section not found');

  const deletedVideo = await Video.findOneAndDelete({
    section_id: section._id,
    video_id,
  });

  if (!deletedVideo) throw new Error('Video not found');
  return deletedVideo;
};

module.exports = {
  addVideoToSection,
  getVideosBySectionId,
  getVideoById,
  updateVideo,
  deleteVideo,
};