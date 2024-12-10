const { PrismaClient, Prisma } = require('@prisma/client'); // Import Prisma Client and Prisma errors
const prisma = new PrismaClient(); // Instantiate Prisma Client

module.exports = (app) => {
    // Error handler middleware
    const errorHandler = (err, req, res, next) => {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            return res.status(400).json({ message: 'Duplicate entry found.' });
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            return res.status(404).json({ message: 'Section not found.' });
        }
        if (err instanceof Prisma.PrismaClientValidationError) {
            return res.status(400).json({ message: 'Validation error in Prisma request.' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
    };

    // Add a new section
    app.post('/sections/add-section', async (req, res, next) => {
        try {
            const {
                course_id,
                section_id,
                section_title,
                order,
                section_description
            } = req.body;

            // Check if section already exists
            const existingSection = await prisma.section.findUnique({
                where: { section_id }
            });
            if (existingSection) {
                return res.status(400).json({ message: 'Section with this ID already exists' });
            }

            // Create the section
            const newSection = await prisma.section.create({
                data: {
                    course_id,
                    section_id,
                    section_title,
                    order,
                    section_description
                }
            });

            res.status(201).json(newSection);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

      
      // Get all sections along with their related data
      app.get('/sections/all', async (req, res, next) => {
        try {
            const sections = await prisma.section.findMany({
                include: {
                    quizzes: true,                // Correct relation name for quizzes
                    course: true,                 // Correct relation name for course
                    userProgressVideos: true,     // Correct relation name for userProgressVideos
                    videos: true                  // Correct relation name for videos
                }
            });
    
            if (sections.length === 0) {
                return res.status(404).json({ message: 'No sections found.' });
            }
    
            res.status(200).json(sections);
        } catch (err) {
            console.error(err);
            next(err); // Pass error to the error handler
        }
    });

// Get sections for a specific course by courseId
app.get('/sections/all/:courseId', async (req, res, next) => {
    try {
        const { courseId } = req.params;

        // Validate that courseId is an integer
        const parsedCourseId = parseInt(courseId, 10);
        if (isNaN(parsedCourseId)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        // Check if the course exists
        const courseExists = await prisma.course.findUnique({
            where: { id: parsedCourseId }
        });
        
        if (!courseExists) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Fetch sections for a specific course
        const sections = await prisma.section.findMany({
            where: {
                course_id: parsedCourseId // Filter by course_id
            },
            include: {
                quizzes: true,               // Correct relation name for quizzes
                course: true,                // Correct relation name for course
                userProgressVideos: true,    // Correct relation name for userProgressVideos
                videos: true                 // Correct relation name for videos
            }
        });

        if (sections.length === 0) {
            return res.status(404).json({ message: 'No sections found for this course.' });
        }

        res.status(200).json(sections);
    } catch (err) {
        next(err); // Pass error to the error handler
    }
});

// Get a specific section by ID
app.get('/sections/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const section = await prisma.section.findUnique({
            where: { id: parseInt(id) },
            include: {
                quizzes: true,               // Correct relation name for quizzes
                course: true,                // Correct relation name for course
                userProgressVideos: true,    // Correct relation name for userProgressVideos
                videos: true                 // Correct relation name for videos
            }
        });
        
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        res.status(200).json(section);
    } catch (err) {
        next(err); // Pass error to the error handler
    }
});


      

    // Delete a specific section by ID
    app.delete('/sections/delete/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const deletedSection = await prisma.section.delete({
                where: { id: parseInt(id) }
            });
            res.status(200).json({ message: 'Section deleted', deletedSection });
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Update a specific section by ID
    app.put('/sections/update/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                course_id,
                section_id,
                section_title,
                order,
                section_description
            } = req.body;

            const updateData = {
                course_id,
                section_id,
                section_title,
                order,
                section_description
            };

            const updatedSection = await prisma.section.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            res.status(200).json(updatedSection);
        } catch (err) {
            next(err); // Pass error to the error handler
        }
    });

    // Use the error handler
    app.use(errorHandler);
};
