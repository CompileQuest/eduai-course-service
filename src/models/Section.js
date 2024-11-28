const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    section_id: {
      type: String,
      required: true,
      unique: true, // Ensure section_id is unique
    },
    section_title: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    section_description: {
      type: String,
    },
  },
  { id: false } // Prevent MongoDB from adding an implicit `id` field
);

module.exports = mongoose.model('Section', sectionSchema);
