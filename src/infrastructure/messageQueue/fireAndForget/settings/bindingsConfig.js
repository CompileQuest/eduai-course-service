import { RoutingKeys } from "./routingKeys.js";

const bindingsConfig = {
    course_service: {
        exchange: "course_exchange",
        queue: "course_queue",
        bindings: [
            // { exchange: "user_exchange", routingKeys: [RoutingKeys.COURSE_CREATED] },
            { exchange: "webhook_exchange", routingKeys: [RoutingKeys.CLOUDINARY_UPLOAD] },
        ],
    }
};


export default bindingsConfig;
