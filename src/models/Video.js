const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  section_id: {
    type: mongoose.Schema.Types.ObjectId, // References the Section model
    ref: 'Section',
    required: true,
  },
  video_id: {
    type: String,
    unique: true,
    required: true,
  },
  video_url: {
    type: String,
    required: true,
  },
  video_duration: {
    type: Number,
    required: true,
  },
  is_locked: {
    type: Boolean,
    default: false,
  },
  is_previewable: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Video', videoSchema);
