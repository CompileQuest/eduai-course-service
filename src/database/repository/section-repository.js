const Section = require('../../models/Section');
const { APIError, STATUS_CODES } = require('../../utils/app-errors');

class SectionRepository {
  // Add a new section to a course
  async AddSection(courseId, sectionDetails) {
    try {
      const newSection = new Section({
        course_id: courseId, // Use courseId from the request
        ...sectionDetails, // Spread other section details
      });
      return await newSection.save();
    } catch (err) {
      throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Section');
    }
  }

  // Fetch all sections for a specific course
  async FetchAllSections(courseId) {
    try {
      return await Section.find({ course_id: courseId });
    } catch (err) {
      throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Sections');
    }
  }

  // Fetch a specific section by course_id and section_id
  async FetchSectionById(courseId, sectionId) {
    try {
      return await Section.findOne({ course_id: courseId, section_id: sectionId });
    } catch (err) {
      throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Section');
    }
  }

  // Update a section by course_id and section_id
  async UpdateSection(courseId, sectionId, updates) {
    try {
      const updatedSection = await Section.findOneAndUpdate(
        { course_id: courseId, section_id: sectionId },
        { $set: updates },
        { new: true }
      );
      if (!updatedSection) throw new Error('Section Not Found');
      return updatedSection;
    } catch (err) {
      throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Update Section');
    }
  }

  // Delete a specific section by section_id and course_id
  async DeleteSection(courseId, sectionId) {
    try {
      const deletedSection = await Section.findOneAndDelete({
        course_id: courseId,
        section_id: sectionId,
      });
      if (!deletedSection) throw new Error('Section Not Found');
      return deletedSection;
    } catch (err) {
      throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Delete Section');
    }
  }
}

module.exports = SectionRepository;