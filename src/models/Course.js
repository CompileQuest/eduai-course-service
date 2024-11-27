// course.js
const mongoose = require('mongoose');

// Define the Course Schema
const CourseSchema = new mongoose.Schema({
  course_id: { type: String, required: true, unique: true }, // Unique identifier for each course
  thumbnail_url: { type: String }, // Thumbnail image URL
  introduction: { type: String }, // Brief course introduction
  enrolled_number: { type: Number, default: 0 }, // Number of enrolled students
  difficulty_level: { type: String }, // Difficulty level (e.g., Beginner, Intermediate)
  price: { type: Number, required: true }, // Original price
  discounted_price: { type: Number }, // Discounted price
  category_id: { type: String, ref: 'Category' }, // Reference to category collection
  requirements: { type: [String] }, // Array of prerequisites
  duration: { type: Number }, // Total course duration in minutes
  introduction_video_link: { type: String }, // Link to introduction video
  description: { type: String }, // Detailed description
  transcript: { type: String }, // Transcript of the course

  // Embedded array of sections
  sections: [
    {
      section_id: { type: String, required: true }, // Unique identifier for section
      section_title: { type: String, required: true }, // Section title
      section_description: { type: String }, // Section description
      videos: [ // Embedded videos
        {
          video_id: { type: String, required: true }, // Unique identifier for video
          video_url: { type: String, required: true }, // Video URL
          video_duration: { type: Number }, // Duration in minutes
          is_locked: { type: Boolean, default: true }, // Locked status
          is_previewable: { type: Boolean, default: false }, // Previewable status
        }
      ],
      articles: [ // Embedded articles
        {
          article_id: { type: String, required: true }, // Unique identifier for article
          article_title: { type: String }, // Article title
          article_content: { type: String } // Article content
        }
      ]
    }
  ],

  // Metadata for the course
  metadata: {
    total_sections: { type: Number },
    total_videos: { type: Number },
    total_articles: { type: Number },
    average_rating: { type: Number, default: 0 },
  }
}, { timestamps: true });

// Export the Course model
module.exports = mongoose.model('Course', CourseSchema);
