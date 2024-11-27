const CourseService = require('../../services/course-service');

module.exports = (app) => {
    const service = new CourseService();

    // Add a new course
    app.post('/courses/', async (req, res, next) => {
        try {
            // Destructuring the request body to extract necessary fields
            const {
                course_id,
                title,
                description,
                thumbnail_url,
                enrolled = 0,    // Default value
                difficulty,
                price,
                discount = 0,   // Default value
                category,
                requirements = [],  // Default value (empty array)
                duration,
                videos = 0,     // Default value
                articles = 0,   // Default value
                reviews = [],   // Default value (empty array)
                faqs = [],      // Default value (empty array)
                metadata = {}   // Default value (empty object)
            } = req.body;
    
            // Construct the course data object
            const courseData = {
                course_id,
                title,
                description,
                thumbnail_url,
                enrolled,
                difficulty,
                price,
                discount,
                category,
                requirements,
                duration,
                videos,
                articles,
                reviews,
                faqs,
                metadata
            };
    
            // Call the service to add the course
            const course = await service.AddCourse(courseData);
    
            // Respond with the created course
            res.status(201).json(course);
        } catch (err) {
            // Pass the error to the error handler
            next(err);
        }
    });
    

    // Get all courses
    app.get('/courses/all', async (req, res, next) => {
        try {
            const courses = await service.FetchAllCourses();
            res.status(200).json(courses);
        } catch (err) {
            next(err);
        }
    });

    // Get a specific course by ID
    app.get('/courses/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const course = await service.FetchCourseById(id);
            res.status(200).json(course);
        } catch (err) {
            next(err);
        }
    });

    // Delete a specific course by ID
    app.delete('/courses/delete/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const course = await service.DeleteCourseById(id);
            res.status(200).json({ message: 'Course deleted', course });
        } catch (err) {
            next(err);
        }
    });

    // Update a specific course by ID
    app.put('/courses/update/:id', async (req, res, next) => {
        try {
            const { id } = req.params;
            const { thumbnailUrl, introduction, enrolled, difficulty, price, discount, category, requirements, duration, videos, articles, reviews, faqs, metadata } = req.body;
            const updateData = { thumbnailUrl, introduction, enrolled, difficulty, price, discount, category, requirements, duration, videos, articles, reviews, faqs, metadata };
            const course = await service.UpdateCourse(id, updateData);
            res.status(200).json(course);
        } catch (err) {
            next(err);
        }
    });
};
