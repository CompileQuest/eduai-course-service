const videoRepository = require('./video-repository');

// ** Add a new video to a section **
const addVideoToSectionService = async (videoData) => {
  try {
    const { section_id, video_id, video_url, video_duration, is_locked, is_previewable } = videoData;
    const newVideo = await videoRepository.addVideoToSection({
      section_id,
      video_id,
      video_url,
      video_duration,
      is_locked,
      is_previewable,
    });

    return newVideo;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ** Get all videos for a specific section **
const getVideosBySectionIdService = async (section_id) => {
  try {
    const videos = await videoRepository.getVideosBySectionId(section_id);
    return videos;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ** Get a specific video by its video_id and section_id **
const getVideoByIdService = async (section_id, video_id) => {
  try {
    const video = await videoRepository.getVideoById(section_id, video_id);
    return video;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ** Update a video for a specific section **
const updateVideoService = async (section_id, video_id, videoData) => {
  try {
    const updatedVideo = await videoRepository.updateVideo(section_id, video_id, videoData);
    return updatedVideo;
  } catch (error) {
    throw new Error(error.message);
  }
};

// ** Delete a specific video **
const deleteVideoService = async (section_id, video_id) => {
  try {
    const deletedVideo = await videoRepository.deleteVideo(section_id, video_id);
    return deletedVideo;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  addVideoToSectionService,
  getVideosBySectionIdService,
  getVideoByIdService,
  updateVideoService,
  deleteVideoService,
};