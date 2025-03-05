const { ForbiddenError, UnauthorizedError } = require('../../utils/app-error');

const checkRole = (requiredRoles = []) => {
    return (req, res, next) => {
        if (!req.auth) {
            return next(new UnauthorizedError("No authentication data found"));
        }

        // Extract user's roles safely
        const userRoles = req.auth["st-role"]?.v || [];

        // Check if the user has at least one required role
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return next(new ForbiddenError(`Access denied: Requires one of the roles [${requiredRoles.join(", ")}]`));
        }

        next();
    };
};
const getUserId = (auth) => {
    if (!auth || !auth.sub) {
        throw new Error("User ID not found in authentication data");
    }
    return auth.sub; // `sub` contains the user ID
};

module.exports = { checkRole, getUserId };
