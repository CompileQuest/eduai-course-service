const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Primary Key
    course_id: { type: Number, required: true },       // Foreign Key linking to Course
    section_id: { type: String, required: true, unique: true }, // Unique identifier
    section_title: { type: String, required: true },  // Title of the section
    order: { type: Number, required: true },          // Order of the section
    section_description: { type: String }            // Description of the section
});

const Section = mongoose.model('Section', SectionSchema);

module.exports = Section;
