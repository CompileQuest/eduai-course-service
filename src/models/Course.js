const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    course_id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    thumbnail_url: { type: String },
    enrolled: { type: Number, default: 0 },
    difficulty: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: String },
    requirements: { type: [String] },
    duration: { type: String },
    videos: { type: Number },
    articles: { type: Number },
    reviews: { type: [String] },
    faqs: { type: [String] },
    metadata: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
