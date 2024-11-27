const CourseModel = require('../../models/Course');
const { APIError, STATUS_CODES } = require('../../utils/app-errors');

class CourseRepository {
    async AddCourse(courseDetails) {
        try {
            const course = new CourseModel(courseDetails);
            return await course.save();
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Course');
        }
    }

    async FetchAllCourses() {
        try {
            return await CourseModel.find();
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Courses');
        }
    }

    async FetchCourseById(courseId) {
        try {
            const course = await CourseModel.findOne({ course_id: courseId.trim() });
            if (!course) throw new Error('Course Not Found');
            return course;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Fetch Course');
        }
    }

    async DeleteCourseById(courseId) {
        try {
            const course = await CourseModel.findOneAndDelete({ course_id: courseId.trim() });
            if (!course) throw new Error('Course Not Found');
            return course;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Delete Course');
        }
    }

    async UpdateCourseById(courseId, updates) {
        try {
            updates.updated_at = new Date();
            const course = await CourseModel.findOneAndUpdate(
                { course_id: courseId.trim() },
                { $set: updates },
                { new: true, runValidators: true }
            );
            if (!course) throw new Error('Course Not Found');
            return course;
        } catch (err) {
            throw new APIError('Database Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Update Course');
        }
    }
}

module.exports = CourseRepository;
