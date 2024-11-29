const express = require('express');
const Video = require('../../models/Video'); // Ensure this path is correct
const Section = require('../../models/Section'); // Ensure this path is correct
const router = express.Router();

// ** Add a new video to a section by using section_id string **
router.post('/sections/:section_id/videos', async (req, res, next) => {
  try {
    const { video_id, video_url, video_duration, is_locked, is_previewable } = req.body;

    // Find the section by section_id
    const section = await Section.findOne({ section_id: req.params.section_id });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Create a new video
    const newVideo = new Video({
      section_id: section._id, // Use the section's MongoDB _id
      video_id, // Unique video identifier
      video_url,
      video_duration,
      is_locked,
      is_previewable,
    });

    // Save the new video to the database
    await newVideo.save();

    res.status(201).json(newVideo);
  } catch (err) {
    console.error('Error occurred:', err);
    next(err);
  }
});

// ** Get all videos for a specific section by using section_id string **
router.get('/sections/:section_id/videos', async (req, res, next) => {
  try {
    // Find the section by section_id
    const section = await Section.findOne({ section_id: req.params.section_id });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Find videos associated with the section
    const videos = await Video.find({ section_id: section._id });
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
});

// ** Get a specific video by its video_id and section_id string **
router.get('/sections/:section_id/videos/:video_id', async (req, res, next) => {
  try {
    // Find the section by section_id
    const section = await Section.findOne({ section_id: req.params.section_id });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Find the specific video by video_id and section_id
    const video = await Video.findOne({
      section_id: section._id,
      video_id: req.params.video_id,
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json(video);
  } catch (err) {
    next(err);
  }
});

// ** Update a video for a specific section by using section_id string **
router.put('/sections/:section_id/videos/:video_id', async (req, res, next) => {
  try {
    const { video_url, video_duration, is_locked, is_previewable } = req.body;

    // Find the section by section_id
    const section = await Section.findOne({ section_id: req.params.section_id });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Update the video by video_id and section_id
    const updatedVideo = await Video.findOneAndUpdate(
      { section_id: section._id, video_id: req.params.video_id },
      { video_url, video_duration, is_locked, is_previewable },
      { new: true }
    );

    if (!updatedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(200).json(updatedVideo);
  } catch (err) {
    next(err);
  }
});

// ** Delete a specific video by video_id and section_id string **
router.delete('/sections/:section_id/videos/:video_id', async (req, res, next) => {
  try {
    // Find the section by section_id
    const section = await Section.findOne({ section_id: req.params.section_id });
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Delete the video by video_id and section_id
    const deletedVideo = await Video.findOneAndDelete({
      section_id: section._id,
      video_id: req.params.video_id,
    });

    if (!deletedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = (app) => {
  app.use('/api', router); // Use this router for all routes starting with /api
};
