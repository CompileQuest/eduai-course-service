import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import { UnauthorizedError, ForbiddenError, BadRequestError } from "../../utils/app-errors.js"; // Import custom error classes
const mock = false;
// Function to extract JWT from request
const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        //   console.log("Authorization Header Token:", authHeader);
        return authHeader.split(" ")[1];
    }

    if (req.cookies?.sAccessToken) {
        // console.log("Token from Cookies:", req.cookies.sAccessToken);
        return req.cookies.sAccessToken;
    }

    return null;
};


// JWT Authentication Middleware
const checkAuth = (req, res, next) => {

    jwt({
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 10 * 60 * 1000,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: "http://localhost:8080/api/v1/auth/jwt/jwks.json",
        }),
        algorithms: ["RS256"],
        getToken: getTokenFromRequest,
    })(req, res, (err) => {
        if (err) {
            if (err.name === "UnauthorizedError") {
                console.log("we are here ");
                return next(new UnauthorizedError("Invalid authentication token"));
            }
            if (err.code === "credentials_required") {
                return next(new BadRequestError("Authentication token is missing"));
            }
            if (err.code === "permission_denied") {
                return next(new ForbiddenError("You do not have permission to access this resource"));
            }
            return next(new UnauthorizedError("Authentication failed"));
        }
        next();
    });
};

export { checkAuth };
