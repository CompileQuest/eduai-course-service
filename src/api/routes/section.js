const express = require('express');
const Section = require('../../models/Section');  // Ensure the path is correct
const Course = require('../../models/Course');  // Assuming you have a Course model
const router = express.Router();

// Add a new section to a course by using course_id string
router.post('/courses/:course_id/sections', async (req, res, next) => {
    try {
      const { section_title, order, section_description } = req.body;
  
      // Find the course by course_id
      const course = await Course.findOne({ course_id: req.params.course_id });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Generate a unique section_id
      const newSectionId = `section-${Date.now()}`;
  
      // Create a new section
      const newSection = new Section({
        course_id: course._id, // Use the course's MongoDB _id
        section_id: newSectionId, // Dynamically generated
        section_title,
        order,
        section_description,
      });
  
      // Save the new section to the database
      await newSection.save();
  
      res.status(201).json(newSection);
    } catch (err) {
      console.error('Error occurred:', err);
      next(err);
    }
  });
  
// Get all sections for a specific course by using course_id string
router.get('/courses/:course_id/sections', async (req, res, next) => {
  try {
    // Find the course by course_id
    const course = await Course.findOne({ course_id: req.params.course_id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find sections associated with the course
    const sections = await Section.find({ course_id: course._id });
    res.status(200).json(sections);
  } catch (err) {
    next(err);
  }
});

// Get a specific section by its section_id and course_id string
router.get('/courses/:course_id/sections/:section_id', async (req, res, next) => {
  try {
    // Find the course by course_id
    const course = await Course.findOne({ course_id: req.params.course_id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Find the specific section by section_id and course_id
    const section = await Section.findOne({
      course_id: course._id,
      section_id: req.params.section_id
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json(section);
  } catch (err) {
    next(err);
  }
});

// Update a section for a specific course by using course_id string
router.put('/courses/:course_id/sections/:section_id', async (req, res, next) => {
  try {
    const { section_title, order, section_description } = req.body;

    // Find the course by course_id
    const course = await Course.findOne({ course_id: req.params.course_id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update the section by section_id and course_id
    const updatedSection = await Section.findOneAndUpdate(
      { course_id: course._id, section_id: req.params.section_id },
      { section_title, order, section_description },
      { new: true }
    );

    if (!updatedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json(updatedSection);
  } catch (err) {
    next(err);
  }
});

// Delete a specific section by section_id and course_id string
router.delete('/courses/:course_id/sections/:section_id', async (req, res, next) => {
  try {
    // Find the course by course_id
    const course = await Course.findOne({ course_id: req.params.course_id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete the section by section_id and course_id
    const deletedSection = await Section.findOneAndDelete({
      course_id: course._id,
      section_id: req.params.section_id
    });

    if (!deletedSection) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = (app) => {
  app.use('/api', router);  // This tells Express to use this router for all routes starting with /api
};
