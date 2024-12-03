const SectionRepository = require('../database/repository/section-repository');
const { APIError } = require('../utils/app-errors');

class SectionService {
  constructor() {
    this.repository = new SectionRepository();
  }

  // Add a new section to a course
  async AddSection(courseId, sectionDetails) {
    return await this.repository.AddSection(courseId, sectionDetails);
  }

  // Fetch all sections for a specific course
  async FetchAllSections(courseId) {
    return await this.repository.FetchAllSections(courseId);
  }

  // Fetch a specific section by course_id and section_id
  async FetchSectionById(courseId, sectionId) {
    return await this.repository.FetchSectionById(courseId, sectionId);
  }

  // Update a section by course_id and section_id
  async UpdateSection(courseId, sectionId, updates) {
    return await this.repository.UpdateSection(courseId, sectionId, updates);
  }

  // Delete a specific section by section_id and course_id
  async DeleteSection(courseId, sectionId) {
    return await this.repository.DeleteSection(courseId, sectionId);
  }
}

module.exports = SectionService;