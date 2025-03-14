import AdminService from '../../../services/admin-service.js';
import { BadRequestError } from '../../../utils/app-errors.js';
import express from 'express';


const adminService = new AdminService();
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Hello world from the admin hahaha ');
});


router.get('/courses', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        const response = await adminService.getPaginatedCourses(page, limit, status);
        res.status(response.statusCode).json(response); // ✅ Returns service response directly
    } catch (err) {
        next(err);
    }
});


router.get('/courses/filter', async (req, res, next) => {
    try {
        // Extract filters from query parameters
        const {
            searchByTitle, title,
            page = 1, limit = 10
        } = req.query;

        // Convert Boolean & Number values (since query params are strings)
        const filters = {
            searchByTitle: searchByTitle === "true",
            title,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
        };

        // Call service function
        const response = await adminService.getCoursesFiltered(filters);
        res.status(200).json(response); // ✅ Returns the filtered courses
    } catch (err) {
        next(err);
    }
});


export default router;

