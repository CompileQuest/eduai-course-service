const CourseRouterV1 = require('./v1/course');
const CloudinaryRouterV1 = require('./v1/cloudinary');
const QuizHandler = require('./v1/quiz-handler');
module.exports = (app) => {
    // version 1 api's 
    app.use('/api/v1/course', CourseRouterV1); // Register version 1 routes
    app.use('/api/v1/course/cloudinary', CloudinaryRouterV1); // Register version 1 routes
    app.use('/api/v1/course/quiz-handler', QuizHandler)
    // Add more versions or route groups as needed
    //app.use('/api/v1/user', appEvent);

};
