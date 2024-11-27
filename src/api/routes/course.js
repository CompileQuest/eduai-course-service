const CourseService = require('../../services/course-service');

module.exports = (app) => {
    const service = new CourseService();

    // Add a new course
    app.post('/add-course', async (req, res, next) => {
        try {
            const course = await service.AddCourse(req.body);
            res.status(201).json(course);
        } catch (err) {
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
