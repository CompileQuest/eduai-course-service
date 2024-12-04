const SectionRepository = require('../database/repository/section-repository');
const { APIError } = require('../utils/app-errors');

class SectionService {
    constructor() {
        this.repository = new SectionRepository();
    }

    async AddSection(sectionDetails) {
        return await this.repository.AddSection(sectionDetails);
    }

    async FetchAllSections() {
        return await this.repository.FetchAllSections();
    }

    async FetchSectionById(sectionId) {
        return await this.repository.FetchSectionById(sectionId);
    }

    async DeleteSectionById(sectionId) {
        return await this.repository.DeleteSectionById(sectionId);
    }

    async UpdateSection(sectionId, updates) {
        return await this.repository.UpdateSectionById(sectionId, updates);
    }
}

module.exports = SectionService;
