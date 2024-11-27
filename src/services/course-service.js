const CourseRepository = require('../database/repository/course-repository');
const { APIError } = require('../utils/app-errors');

class CourseService {
    constructor() {
        this.repository = new CourseRepository();
    }

    async AddCourse(courseDetails) {
        return await this.repository.AddCourse(courseDetails);
    }

    async FetchAllCourses() {
        return await this.repository.FetchAllCourses();
    }

    async FetchCourseById(courseId) {
        return await this.repository.FetchCourseById(courseId);
    }

    async DeleteCourseById(courseId) {
        return await this.repository.DeleteCourseById(courseId);
    }

    async UpdateCourse(courseId, updates) {
        return await this.repository.UpdateCourseById(courseId, updates);
    }
}

module.exports = CourseService;
