const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { APIError, STATUS_CODES } = require('../../utils/error-handler');
const { AppError } = require('../../utils/error-handler');

class CourseRepository {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async AddCourse(courseDetails) {
        try {
            return await this.prisma.course.create({
                data: courseDetails,
            });
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Course');
        }
    }

    async FetchAllCourses() {
        try {
            return await this.prisma.course.findMany();
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Courses');
        }
    }

    async FetchCourseTemplateById(courseId) {

        const course = await this.prisma.course.findUnique({
            where: { id: courseId.trim() },
            select: {
                title: true,
                thumbnailUrl: true,
                shortDescription: true,
                description: true,
                WhatWillYouLearn: true,
                requirements: true,
                difficultyLevel: true,
                price: true,
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true
                            }
                        }, // Fetch the related Category through CourseCategory
                    },
                },
                sections: {
                    select: {
                        id: true,
                        sectionTitle: true,
                        order: true,
                    },
                    orderBy: {
                        order: 'asc'
                    }
                },
            },
        });
        return course;
    }



    async FetchCourseThumbnail(courseId) {
        return prisma.course.findUnique({
            where: { id: courseId },
            select: {
                thumbnailUrl: true,
                thumbnailPublicId: true
            }
        });
    }


    async DeleteCourseById(courseId) {
        try {
            const course = await this.prisma.course.delete({
                where: { course_id: courseId.trim() },
            });
            if (!course) throw new Error('Course Not Found');
            return course;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Delete Course');
        }
    }

    async UpdateCourseById(courseId, updates) {
        try {
            const course = await this.prisma.course.update({
                where: { course_id: courseId.trim() },
                data: updates,
            });
            if (!course) throw new Error('Course Not Found');
            return course;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Update Course');
        }
    }

    async FetchCategories() {
        try {
            const categories = await this.prisma.category.findMany();

            if (!categories) {
                throw new APIError('Data Not Found', STATUS_CODES.NOT_FOUND, 'No Categories Found');
            }

            return categories;
        } catch (err) {
            console.error('Error in FetchCategories:', err); // Debug log
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Categories');
        }
    }

    async CreateCourseTemplate(courseData) {
        try {
            // First, create the course
            const course = await this.prisma.course.create({
                data: {
                    title: courseData.title,
                    thumbnailUrl: null,  // Will be updated later
                    shortDescription: courseData.short_description,
                    description: courseData.description,
                    WhatWillYouLearn: courseData.what_you_will_learn,
                    requirements: courseData.requirements,
                    difficultyLevel: courseData.level,
                    price: courseData.price,
                    status: 'draft',
                    // Create the category connection
                    categories: {
                        create: {
                            categoryId: courseData.category_id
                        }
                    }
                }
            });

            // Then create sections if they exist
            if (courseData.sections && courseData.sections.length > 0) {
                await this.prisma.section.createMany({
                    data: courseData.sections.map((section, index) => ({
                        courseId: course.id,
                        sectionTitle: section.title,
                        order: index + 1
                    }))
                });
            }

            return course;
        } catch (error) {
            console.error("Repository Error:", error);
            throw new AppError(
                "Unable to Create Course Template",
                error.statusCode || 500,
                error.message
            );
        }
    }

    async UpdateCourseTemplate(courseId, imageData) {
        try {

            const updatedTemplate = await this.prisma.course.update({
                where: { id: courseId },
                data: {
                    thumbnailUrl: imageData.url,
                    thumbnailPublicId: imageData.publicId
                },
            });

            if (!updatedTemplate) {
                throw new APIError('Course template not found', STATUS_CODES.NOT_FOUND);
            }

            console.log("updatedTemplate", updatedTemplate);

            return updatedTemplate;
        } catch (error) {
            throw new APIError(
                'Error updating course template',
                error.statusCode || STATUS_CODES.INTERNAL_ERROR,
                error.message
            );
        }
    }

    async DeleteCourseTemplate(courseId) {
        try {
            return await this.prisma.$transaction(async (prisma) => {
                // Delete sections first
                await prisma.section.deleteMany({
                    where: { courseId: courseId }
                });

                // Delete course categories
                await prisma.courseCategory.deleteMany({
                    where: { courseId: courseId }
                });

                // Finally delete the course
                return await prisma.course.delete({
                    where: { id: courseId }
                });
            });
        } catch (error) {
            throw new APIError(
                'Error deleting course template',
                error.statusCode || STATUS_CODES.INTERNAL_ERROR,
                error.message
            );
        }
    }

    async FetchCourseTemplate() {
        try {
            return await this.prisma.course.findMany({
                where: {
                    status: 'draft'
                },
                select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    status: true
                }
            });
        } catch (err) {
            console.error('Error fetching course templates:', err); // Log the error details
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Course Template');
        }
    }

    // for now this only is used for showing the section edit later to make function that only shows section
    async FetchCourseContentById(courseId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                sections: {
                    where: { deletedAt: null },
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        sectionTitle: true,
                        order: true,
                        videos: {
                            select: {
                                id: true,
                                title: true,
                                duration: true,
                            },
                        },
                    },
                },
            },
        });

        return course; // No "not found" check here
    }

    async SaveVideoToSection(payload) {
        // Extract fields
        const { sectionId, courseId, title } = payload.context.custom;
        const {
            asset_id,
            request_id,
            public_id, // Matches the Prisma schema
            secure_url,
            playback_url,
            format,
            width,
            height,
            duration,
            folder,
            notification_type,
            original_filename,
        } = payload;

        // Create the video in the database
        const video = await this.prisma.video.create({
            data: {
                asset_id, // Matches the Prisma schema
                request_id, // Matches the Prisma schema
                public_id, // Matches the Prisma schema
                secure_url, // Matches the Prisma schema
                playback_url, // Matches the Prisma schema
                sectionId, // Matches the Prisma schema
                title, // Matches the Prisma schema
                format, // Matches the Prisma schema 
                width, // Matches the Prisma schema
                height, // Matches the Prisma schema
                duration, // Matches the Prisma schema  
                folder, // Matches the Prisma schema
                notification_type, // Matches the Prisma schema
                original_filename, // Matches the Prisma schema  
            },
        });

        console.log("Video saved successfully:", video); // Success message

        return video;

    }


    async getCoursePreview(courseId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                sections: {
                    select: {
                        id: true,
                        sectionTitle: true,
                        order: true,
                        videos: {
                            select: {
                                id: true,
                                title: true,
                                duration: true,
                                order: true
                            },
                            orderBy: {
                                order: "asc" // here i am sorting the video 
                            }
                        }
                    }, orderBy: {
                        order: "asc"
                    }
                },
                reviews: true,
                tags: true,
                categories: true,
                faqs: true,
                statistics: true,
                userProgressCousre: true, // Assuming the course progress is also needed
            },
        });

        return course;
    }




    // In your repository class o r file

    async getSectionsByCourse(courseId) {
        return prisma.section.findMany({
            where: { courseId: courseId },  // Filter sections by course ID
            select: {
                id: true,
                deletedAt: null
            },  // Only select the section IDs
        });
    }


    async updateVideoOrder(videoId, newOrder) {
        // Update the video order in the database
        return prisma.video.update({
            where: { id: videoId }, // Find the video by its ID
            data: { order: newOrder }, // Set the new order
        });
    }
    async UpdateSectionsSorting(courseId, sections) {
        try {
            // Verify that all sections belong to the specified course
            const sectionIds = sections.map(section => section.id);
            const existingSections = await this.prisma.section.findMany({
                where: {
                    id: { in: sectionIds },
                    courseId: courseId // Ensure sections belong to the specified course
                }
            });

            if (existingSections.length !== sections.length) {
                throw new APIError('Validation Error', STATUS_CODES.BAD_REQUEST, 'Some sections do not belong to the specified course');
            }

            // Iterate through each section and update its order
            const updatePromises = sections.map(section => {
                return this.prisma.section.update({
                    where: { id: section.id },
                    data: { order: section.order }
                });
            });
            // Wait for all updates to complete
            return await Promise.all(updatePromises);
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Update Sections Sorting');
        }
    }


    async getMaxOrderOfSectionsByCourseId(courseId) {
        const section = await prisma.section.findFirst({
            where: { courseId },
            orderBy: { order: 'desc' },
            select: { order: true }, // Only select the 'order' field
        });
        return section ? section.order : 0; // If no section is found, return 0
    }


    async addSection(courseId, title, newOrder) {
        return prisma.section.create({
            data: {
                sectionTitle: title,
                order: newOrder,
                courseId,
            },
        });
    }



    async checkOwnershipOfCourse(courseId, instructorId) {
        return await this.prisma.course.findFirst({
            where: {
                id: courseId,
                instructorId: instructorId
            }
        });
    }

    async markSectionAsDelete(sectionId) {
        return await this.prisma.section.update({
            where: { id: sectionId },
            data: { deletedAt: new Date() }
        });
    }


    async editSection(sectionId, title) {
        return this.prisma.section.update({
            where: { id: sectionId },
            data: {
                sectionTitle: title
            }
        });
    }

    async getSectionVideosIds(sectionId) {
        const videos = await this.prisma.video.findMany({
            where: { sectionId: sectionId },
            select: { id: true }
        });
        return videos.map(video => video.id);
    }

    async markVideoDelete(videoId) {
        return await this.prisma.video.update({
            where: { id: videoId },
            data: { deletedAt: new Date() }
        });
    }

}

module.exports = CourseRepository; 
