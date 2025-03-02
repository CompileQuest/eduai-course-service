const CourseRouterV1 = require('./v1/course');
const CloudinaryRouterV1 = require('./v1/cloudinary');
const QuizHandler = require('./v1/quiz-handler');
const ChatBotHandler = require('./v1/chatbot-handler');
const AdminHandler = require('./v1/admin-handler')
module.exports = (app) => {
    // version 1 api's 
    app.use('/api/v1/course', CourseRouterV1); // Register version 1 routes
    app.use('/api/v1/course/cloudinary', CloudinaryRouterV1); // Register version 1 routes
    app.use('/api/v1/course/quiz-handler', QuizHandler)
    app.use('/api/v1/course/chatbot-handler', ChatBotHandler);
    app.use('/api/v1/course/admin-handler', AdminHandler);

    // Add more versions or route groups as needed
    //app.use('/api/v1/user', appEvent);

};
