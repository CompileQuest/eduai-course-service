import { ForbiddenError, UnauthorizedError } from '../../utils/app-errors.js';
const mock = true;
const checkRole = (requiredRoles = []) => {
    return (req, res, next) => {

        if (mock) {
            return 'STUDENT';
        }

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

const getUserId = (auth, Role) => {
    if (mock && Role === 'STUDENT') {
        return 'asdfa2342fasrq23fwe234fasd';
    }

    if (mock && Role === 'INSTRUCTOR') {
        return 'c1243e05-49f2-4931-9d73-f77a049a5935';
    }

    if (!auth || !auth.sub) {
        console.warn("Missing user ID in authentication data");
        return null;
    }
    return auth.sub; // `sub` contains the user ID
};


const getCurrentRole = (auth) => {
    if (mock) {
        return 'STUDENT';
    }
    if (!auth || !auth.sub) {
        console.warn("Missing user Role in authentication data");
        return null;
    }

    //return auth.sub; // `sub` contains the user ID
    return auth.role;
}

export { checkRole, getUserId, getCurrentRole };
