import { PrismaClient } from '@prisma/client';
import { APIError, STATUS_CODES, AppError } from '../../utils/app-errors.js';
import COURSE_STATUS from '../../constants/courseStatusEnum.js';

const prisma = new PrismaClient();

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



    async getUserOwnedCourses(userId, ownedCourses) {
        try {
            const courses = await prisma.course.findMany({
                where: {
                    id: {
                        in: ownedCourses,
                    },
                },
                select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    averageRating: true,
                    instructorId: true,
                    userProgressCousre: {
                        where: {
                            userId: userId,
                        },
                        select: {
                            isCompleted: true,
                            completedAt: true,
                        },
                    },
                },
            });

            // Map and format results to include progress
            return courses.map((course) => ({
                id: course.id,
                title: course.title,
                thumbnailUrl: course.thumbnailUrl,
                averageRating: course.averageRating,
                instructorId: course.instructorId,
                progress: course.userProgressCousre.length > 0
                    ? course.userProgressCousre[0].isCompleted ? 100 : 0
                    : 0,
            }));
        } catch (err) {
            throw err;
        }
    }



    async getUserBookmarkCourse(courseId) {

        const course = await prisma.course.findMany({
            where: {
                id: courseId
            },
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
            },
        });


        return course;
    }





    async handlePaymentCompleted(userId, courseId) {
        return await this.prisma.$transaction(async (tx) => {
            // Upsert CourseStatistics: increment enrolledNumber or create if not exists
            await tx.courseStatistics.upsert({
                where: { courseId },
                update: { enrolledNumber: { increment: 1 } },
                create: {
                    courseId,
                    enrolledNumber: 1,
                    totalReviews: 0,
                    totalSections: 0,
                    totalLectures: 0,
                    statisticalAverageRating: 0,
                },
            });

            // Check if user progress exists
            const existingProgress = await tx.userProgressCourse.findUnique({
                where: {
                    userId_courseId: { userId, courseId },
                },
            });

            // Create user progress if not exists
            if (!existingProgress) {
                await tx.userProgressCourse.create({
                    data: {
                        userId,
                        courseId,
                        isCompleted: false,
                    },
                });
            }
        });
    }







    async checkIfQuizFileExist(courseId, sectionId) {
        const quizFile = await prisma.file.findMany({
            where: {
                section: {
                    courseId: courseId, // make sure section.course_id matches
                    id: sectionId       // and section.id matches
                },
                format: null,
                public_id: {
                    endsWith: '.txt',
                },
            },
        });

        return quizFile;
    }



    async publishCourse(courseid) {
        const publishedCousre = await prisma.course.update({
            where: { id: courseid },
            data: {
                status: 'PUBLISHED', // If using enum, you can use CourseStatus.PUBLISHED
                publishedAt: new Date(), // Optional: track when it was published
            },
        });

        return publishedCousre;
    }


    async getCousreCartInfo(courseArray) {


        const courses = await prisma.course.findMany({
            where: {
                id: {
                    in: courseArray
                },
                deletedAt: null // To exclude soft-deleted courses
            },
            select: {
                id: true,
                title: true,
                price: true,
                discountedPrice: true,
                thumbnailUrl: true,
                averageRating: true,
                totalReviews: true,
                instructorId: true
            }
        });

        return courses;
    }



    async getCousreCartInfo(courseIdArray) {
        // Fetch courses by courseIds and select only necessary fields
        return await prisma.course.findMany({
            where: {
                id: {
                    in: courseIdArray,  // Match courses whose ID is in the provided array
                }
            },
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                price: true,
            },
        });
    }


    async findCourseById(courseId) {
        return this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
    }

    async updateCourse(courseId, updateData) {
        // Handle category updates if present
        console.log("1");
        if (updateData.category_id) {
            await this.prisma.courseCategory.deleteMany({
                where: { courseId }
            });

            await this.prisma.courseCategory.create({
                data: {
                    courseId,
                    categoryId: updateData.category_id
                }
            });

            // Remove from updateData to avoid Prisma error
            delete updateData.category_id;
        }


        console.log("2");

        // Handle tags updates if present
        if (updateData.tags) {
            await this.prisma.courseTags.deleteMany({
                where: { courseId }
            });

            await this.prisma.courseTags.createMany({
                data: updateData.tags.map(tagId => ({
                    courseId,
                    tagId
                }))
            });

            delete updateData.tags;
        }
        console.log("3");
        // Update the course itself
        return this.prisma.course.update({
            where: { id: courseId },
            data: {
                ...updateData,
                updatedAt: new Date() // Always update the timestamp
            },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
    }



    async FetchCourseById(courseId) {
        try {
            const course = await this.prisma.course.findUnique({
                where: { id: courseId },
                include: {
                    statistics: true,
                    sections: {
                        include: {
                            videos: true,
                            files: true,
                        },
                    },
                    reviews: true,
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    userProgressCousre: true,
                    faqs: true,
                },
            });

            if (!course) {
                throw new APIError('Course Not Found', STATUS_CODES.NOT_FOUND, 'Course does not exist');
            }

            return course;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Course');
        }
    }

    // Fetch categories for a given course
    async fetchCourseCategoryIds(courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: {
                categories: {
                    select: {
                        categoryId: true,
                    },
                },
            },
        });
        console.log("before edit", course);

        // Extract array of category IDs
        const afterEdit = course.categories.map(c => c.categoryId);
        console.log("after edit ", afterEdit);

        return afterEdit
    }

    // Fetch related courses based on category IDs
    async fetchRelatedCoursesByCategory(categoryIds, courseId) {
        const relatedCourses = await this.prisma.course.findMany({
            where: {
                id: {
                    not: courseId,
                },
                categories: {
                    some: {
                        categoryId: {
                            in: categoryIds,
                        },
                    },
                },
                deletedAt: null, // Only non-deleted courses
            },
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                difficultyLevel: true,
                averageRating: true,
                totalReviews: true,
                instructorId: true, // For fetching instructor details later
                sections: {
                    select: {
                        videos: {
                            select: {
                                duration: true, // We'll sum these for total hours
                            },
                            where: {
                                deletedAt: null, // Only non-deleted videos
                            },
                        },
                    },
                    where: {
                        deletedAt: null, // Only non-deleted sections
                    },
                },
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            take: 6, // 👈 LIMIT the number of results to 5
        });

        return relatedCourses;
    }





    async FetchCourseProductionById(courseId) {
        return await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                sections: {
                    include: {
                        videos: {
                            select: {
                                id: true,
                                title: true,
                                order: true,
                                is_free: true,
                                duration: true
                            },
                        },
                        files: {
                            select: {
                                id: true,
                                title: true,
                                order: true,
                                is_free: true,
                            },
                        },
                    },
                },
                statistics: true,
                reviews: true,
                categories: {
                    include: { category: true },
                },
                tags: {
                    include: { tag: true },
                },
                faqs: true,
            },
        });


    }




    async FetchCourseWithUserAccess(courseId) {
        return await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                sections: {
                    include: {
                        videos: {
                            select: {
                                id: true,
                                title: true,
                                order: true,
                                is_free: true,
                                secure_url: true,  // Add secure URL or playback URL for the video
                                playback_url: true, // Or any specific video link field you're using
                                duration: true
                            },
                        },
                        files: {
                            select: {
                                id: true,
                                title: true,
                                order: true,
                                is_free: true,
                            },
                        },
                    },
                },
                statistics: true,
                reviews: true,
                categories: {
                    include: {
                        category: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
                faqs: true,
            },
        });
    }



    async getFilterCoursesPaginated(
        page,
        limit,
        categoriesArray,
        levelsArray,
        rating,
        sortByPolicy
    ) {
        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Build the base query with soft delete check
        const baseQuery = {
            deletedAt: null,
        };

        // Add category filter if categories are specified
        if (categoriesArray.length > 0) {
            baseQuery.categories = {
                some: {
                    categoryId: {
                        in: categoriesArray,
                    },
                },
            };
        }

        // Add difficulty level filter if levels are specified
        if (levelsArray.length > 0) {
            baseQuery.difficultyLevel = {
                in: levelsArray,
            };
        }

        // Add rating filter if specified
        if (rating !== null) {
            baseQuery.averageRating = {
                gte: rating,
            };
        }

        // Determine sorting order
        let orderBy = {};
        switch (sortByPolicy) {
            case 'Newest':
                orderBy = { createdAt: 'desc' };
                break;
            case 'Oldest':
                orderBy = { createdAt: 'asc' };
                break;
            // Add more sorting options as needed
            default:
                orderBy = { createdAt: 'desc' }; // Default to newest
        }

        // Execute the query with pagination
        const [courses, totalCount] = await Promise.all([
            this.prisma.course.findMany({
                where: baseQuery,
                skip,
                take: limit,
                orderBy,
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                    statistics: true,
                },
            }),
            this.prisma.course.count({
                where: baseQuery,
            }),
        ]);

        return {
            data: courses,
            pagination: {
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit,
            },
        };
    }



    async getLandingPageCourses(filter = {}, limit = 10) {
        return await this.prisma.course.findMany({
            where: {
                status: COURSE_STATUS.PUBLISHED, // Only published courses
                // ...filter,  // Allow additional filters if passed
                deletedAt: null, // Exclude soft-deleted courses
            },
            take: limit,
            orderBy: {
                createdAt: 'desc', // Optional: latest courses first
            },
        });
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
                instructorId: courseData.instructorId,
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

    async FetchInstructorCoursesPaginated(instructorId, page, limit) {
        // Ensure page and limit are numbers
        page = parseInt(page, 10) || 1;
        limit = parseInt(limit, 10) || 10;

        const skip = (page - 1) * limit;

        // Define the where condition for filtering courses
        const where = { instructorId: instructorId };

        // Fetch courses and total count in parallel
        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where,  // Apply filter
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' } // Sort by latest
            }),
            this.prisma.course.count({ where }) // Count total courses
        ]);

        return { courses, total };
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
    async FetchCourseContentForInstructor(courseId) {
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
                            where: { deletedAt: null },
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                duration: true,
                                is_free: true,
                                playback_url: true

                            },
                        },
                    },
                },
            },
        });

        return course; // No "not found" check here
    }

    async SaveVideoToSection(payload) {
        try {
            // Extract fields safely from payload
            const { sectionId, courseId, title, isFree } = payload.context.custom || {};

            // Convert `isFree` to a proper boolean
            const is_free = typeof isFree === "boolean" ? isFree : isFree === "true";

            const {
                asset_id,
                request_id,
                public_id,
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

            // Validate required fields before database insertion
            if (!sectionId || !courseId || !public_id || !secure_url) {
                throw new Error("❌ Missing required video fields");
            }

            // Save video to database with correct field names
            const video = await this.prisma.video.create({
                data: {
                    asset_id,
                    request_id,
                    public_id,
                    secure_url,
                    playback_url,
                    sectionId,
                    title,
                    format,
                    width,
                    height,
                    duration,
                    folder,
                    notification_type,
                    original_filename,
                    is_free, // Correct field name for database
                },
            });

            console.log("✅ Video saved successfully:", video);
            return video;
        } catch (error) {
            console.error("🔥 Error saving video:", error);
            throw error;
        }
    }


    async SaveFileToSection(payload) {
        try {
            // Extract fields safely from payload
            const { sectionId, isFree, courseId } = payload.context.custom || {};

            // Convert `isFree` to a proper boolean
            const is_free = typeof isFree === "boolean" ? isFree : isFree === "true";

            const {
                asset_id,
                request_id,
                public_id,
                secure_url,
                playback_url,
                format,
                bytes,
                type,
                etag,
                placeholder,
                folder,
                original_filename,
            } = payload;

            // Validate required fields before database insertion
            if (!sectionId || !public_id || !secure_url) {
                throw new Error("❌ Missing required file fields");
            }

            // Save file to database with correct field names
            const file = await this.prisma.file.create({
                data: {
                    asset_id,
                    request_id,
                    public_id,
                    secure_url,
                    playback_url,
                    sectionId,
                    format,
                    bytes,
                    type,
                    etag,
                    placeholder,
                    folder,
                    original_filename,
                    is_free, // Correct field name for database
                },
            });

            console.log("✅ File saved successfully:", file);
            return file;
        } catch (error) {
            console.error("🔥 Error saving file:", error);
            throw error;
        }
    }


    async getSectionFiles(courseId) {
        const sectionsWithFiles = await prisma.section.findMany({
            where: {
                courseId: courseId,
            },
            select: {
                id: true,
                sectionTitle: true,
                files: true,
            },
        });

        return sectionsWithFiles;
    }




    async getCoursePreview(courseId) {
        const course = await prisma.course.findUnique({
            where: { id: courseId, deletedAt: null },
            include: {
                sections: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        sectionTitle: true,
                        order: true,
                        videos: {
                            where: { deletedAt: null },
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
            where: { courseId: courseId, deletedAt: null },  // Filter sections by course ID
            select: {
                id: true,
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
                course: {
                    connect: { id: courseId } // Connect to an existing course
                },
                quizId: null
            },
        });
    }

    async getSectionTemp(courseId) {
        return prisma.section.findMany({
            where: {
                courseId: courseId,
                deletedAt: null // Exclude soft-deleted sections
            },
            select: {
                id: true,
                sectionTitle: true // Use `sectionTitle` based on your Prisma schema
            }
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

    async editVideo(videoId, title, is_free) {
        return this.prisma.video.update({
            where: { id: videoId },
            data: {
                title: title,
                is_free: is_free
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

export default CourseRepository; 
