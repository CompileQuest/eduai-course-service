const ChatBotService = require('../../../services/chatbot-service');
const { BadRequestError } = require('../../../utils/app-error'); // Change this import
const express = require('express');


const service = new ChatBotService();
const router = express.Router();


router.get('/', (req, res) => {
    res.send('Hello World chatbot handler  service is responding ');
});

router.get('/:courseId/:sectionid/file', async (req, res, next) => {
    try {
        const { courseId, sectionid } = req.params;

        if (!courseId || !sectionid) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        const file = await service.getFileBySectionId(courseId, sectionid);
        res.status(200).json(file);
    } catch (err) {
        console.log("this is the error ", err);
        next(err);
    }
});


router.get('/:courseId/files', async (req, res, next) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            throw new BadRequestError("Invalid or missing inputs field");
        }

        const file = await service.getFilesForCourse(courseId);
        res.status(200).json(file);
    } catch (err) {
        console.log("this is the error ", err);
        next(err);
    }
});

module.exports = router;

