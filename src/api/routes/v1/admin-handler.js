const AdminService = require('../../../services/admin-service');
const { BadRequestError } = require('../../../utils/app-error'); // Change this import
const express = require('express');


const courseService = new AdminService();
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Hello world from the admin hahaha ');
});


router.get('/courses', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        const response = await courseService.getPaginatedCourses(page, limit, status);
        res.status(response.statusCode).json(response); // ✅ Returns service response directly
    } catch (err) {
        next(err);
    }
});


module.exports = router;

