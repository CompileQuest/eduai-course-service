const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  review_id: { type: String, required: true, unique: true },       // Unique review ID
  course_id: { type: String, ref: 'Course', required: true },     // Reference to the course
  user_id: { type: String, ref: 'User', required: true },         // Reference to the user
  rating: { type: Number, required: true },                       // User rating
  comment: { type: String },                                      // User comment
  created_at: { type: Date, default: Date.now }                   // Timestamp
});

module.exports = mongoose.model('Review', ReviewSchema);