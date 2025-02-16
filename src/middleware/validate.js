const { Request, Response, NextFunction } = require("express");
const { ZodSchema } = require("zod");
const { default: errorMap } = require("zod/locales/en.js");

const validate = (schema) => {
    return (req, res, next) => {
        console.log("✅ Checking validation...");
        const validationResult = schema.safeParse(req.body);
        if (!validationResult.success) {
            console.log("❌ Invalid format");
            console.log(validationResult.error.format());
            return res.status(400).json({
                message: "Invalid payload",
                errors: validationResult.error.format(),
            });
        }

        console.log("✅ Validation successful!");
        // Attach validated data to request object
        req.body = validationResult.data;
        next();
    };
};

module.exports = validate;

