import CourseRouterV1 from './v1/course.js';
import CloudinaryRouterV1 from './v1/cloudinary.js';
import QuizHandler from './v1/quiz-handler.js';
import ChatBotHandler from './v1/chatbot-handler.js';
import AdminHandler from './v1/admin-handler.js';
import appEventRouterV1 from './v1/app-events.js';


export default (app) => {
    // Version 1 APIs
    app.use('/api/v1/course', CourseRouterV1);
    app.use('/api/v1/course/cloudinary', CloudinaryRouterV1);
    app.use('/api/v1/course/quiz-handler', QuizHandler);
    app.use('/api/v1/course/chatbot-handler', ChatBotHandler);
    app.use('/api/v1/course/admin-handler', AdminHandler);
    app.use('/api/v1/course/app-events', appEventRouterV1); // Corrected route path.

    // Add more versions or route groups as needed
    // app.use('/api/v1/user', appEvent);
};

