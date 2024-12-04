const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { APIError, STATUS_CODES } = require('../../utils/app-errors');

class SectionRepository {
    async AddSection(sectionDetails) {
        try {
            return await prisma.section.create({
                data: sectionDetails,
            });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Section');
        }
    }

    async FetchAllSections() {
        try {
            return await prisma.section.findMany({
                include: {
                    Quiz: true,
                    Course: true,
                    User_Progress_videos: true,
                    Video: true,
                }
            });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Sections');
        }
    }

    async FetchSectionById(sectionId) {
        try {
            const section = await prisma.section.findUnique({
                where: { section_id: sectionId.trim() },
                include: {
                    Quiz: true,
                    Course: true,
                    User_Progress_videos: true,
                    Video: true,
                }
            });
            if (!section) throw new Error('Section Not Found');
            return section;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Section');
        }
    }

    async DeleteSectionById(sectionId) {
        try {
            const section = await prisma.section.delete({
                where: { section_id: sectionId.trim() },
            });
            if (!section) throw new Error('Section Not Found');
            return section;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Delete Section');
        }
    }

    async UpdateSectionById(sectionId, updates) {
        try {
            const section = await prisma.section.update({
                where: { section_id: sectionId.trim() },
                data: updates,
            });
            if (!section) throw new Error('Section Not Found');
            return section;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Update Section');
        }
    }
}

module.exports = SectionRepository;
