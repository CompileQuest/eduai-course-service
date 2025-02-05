// Temporary auth middleware for testing
const authMiddleware = (req, res, next) => {
    // For testing: always allow requests
    const BYPASS_AUTH = true; // TODO: Remove this when implementing real auth

    if (BYPASS_AUTH) {
        // For testing, add a mock user to the request
        req.user = {
            id: 'test-user-id',
            role: 'instructor',
            // Add any other user properties you might need
        };
        return next();
    }

    // TODO: Implement actual JWT verification here
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) {
    //     return res.status(401).json({ message: 'No token provided' });
    // }

    // try {
    //     // Verify JWT token
    //     // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //     // req.user = decoded;
    //     next();
    // } catch (error) {
    //     return res.status(401).json({ message: 'Invalid token' });
    // }
};

module.exports = {
    authMiddleware
}; 