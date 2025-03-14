// import { Request, Response, NextFunction } from "express";
// import { ZodSchema } from "zod";
// import errorMap from "zod/locales/en.js";

// const validate = (schema) => {
//     return (req, res, next) => {
//         console.log("✅ Checking validation...");
//         const validationResult = schema.safeParse(req.body);
//         if (!validationResult.success) {
//             console.log("❌ Invalid format");
//             console.log(validationResult.error.format());
//             return res.status(400).json({
//                 message: "Invalid payload",
//                 errors: validationResult.error.format(),
//             });
//         }

//         console.log("✅ Validation successful!");
//         // Attach validated data to request object
//         req.body = validationResult.data;
//         next();
//     };
// };

// export default validate;
