const { Request, Response, NextFunction } = require("express");
const { ZodSchema } = require("zod");

const validate = (schema) => {
    return (req, res, next) => {
        console.log("i am inside the validator");
        const validationResult = schema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Invalid payload",
                errors: validationResult.error.format(),
            });
        }

        // Attach validated data to request object
        req.body = validationResult.data;
        next();
    };
};

module.exports = validate;

