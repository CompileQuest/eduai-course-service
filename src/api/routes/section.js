const express = require('express');
const router = express.Router();
const Section = require('../../models/Section'); // Replace with your Section model if named differently

// Fetch all sections of a course
router.get('/courses/:course_id/sections', async (req, res, next) => {
    try {
        const sections = await Section.find({ course_id: req.params.course_id });
        res.status(200).json(sections);
    } catch (err) {
        next(err);
    }
});

// Add a new section to a course
router.post('/courses/:course_id/sections', async (req, res, next) => {
    try {
        const newSection = new Section({
            section_id: req.body.section_id,
            course_id: req.params.course_id,
            title: req.body.title,
            description: req.body.description
        });

        await newSection.save();
        res.status(201).json(newSection);
    } catch (err) {
        next(err);
    }
});

// Fetch details of a specific section
router.get('/courses/:course_id/sections/:section_id', async (req, res, next) => {
    try {
        const section = await Section.findOne({
            course_id: req.params.course_id,
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

// Update a section's details
router.put('/courses/:course_id/sections/:section_id', async (req, res, next) => {
    try {
        const updatedSection = await Section.findOneAndUpdate(
            { course_id: req.params.course_id, section_id: req.params.section_id },
            req.body,
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

// Delete a section from a course
router.delete('/courses/:course_id/sections/:section_id', async (req, res, next) => {
    try {
        const deletedSection = await Section.findOneAndDelete({
            course_id: req.params.course_id,
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
    app.use('/api', router); // All routes start with /api
};
