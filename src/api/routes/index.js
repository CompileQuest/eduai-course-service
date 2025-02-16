const CourseRouterV1 = require('./v1/course');
const CloudinaryRouterV1 = require('./v1/cloudinary');
module.exports = (app) => {
    // version 1 api's 
    app.use('/api/v1/course', CourseRouterV1); // Register version 1 routes
    app.use('/api/v1/cloudinary', CloudinaryRouterV1); // Register version 1 routes

    // Add more versions or route groups as needed
    //app.use('/api/v1/user', appEvent);

};
