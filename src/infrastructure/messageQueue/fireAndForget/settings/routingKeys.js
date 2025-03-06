const RoutingKeys = {
    // User-related events
    USER_CREATED: "user.created",
    USER_UPDATED: "user.updated",
    USER_DELETED: "user.deleted",
    USER_LOGGED_IN: "user.logged_in",
    USER_LOGGED_OUT: "user.logged_out",
    USER_PASSWORD_RESET: "user.password_reset",

    // Course-related events
    COURSE_CREATED: "course.created",
    COURSE_UPDATED: "course.updated",
    COURSE_DELETED: "course.deleted",
    COURSE_PUBLISHED: "course.published",
    COURSE_ENROLLED: "course.enrolled.*",  // Matches course.enrolled.[any ID]
    COURSE_ENROLLED_ALL: "course.enrolled.#", // Matches course.enrolled.[anything]

    // Payment-related events
    PAYMENT_COMPLETED: "payment.completed",
    PAYMENT_FAILED: "payment.failed",
    PAYMENT_REFUNDED: "payment.refunded",
    PAYMENT_INVOICE_GENERATED: "payment.invoice.generated",
    PAYMENT_ALL_EVENTS: "payment.#",  // Matches any payment-related event

    // Notification-related events
    NOTIFICATION_SENT: "notification.sent",
    NOTIFICATION_FAILED: "notification.failed",
    NOTIFICATION_ALL: "notification.#",  // Matches all notification events

    // Wildcard examples
    SERVICE_ANY_ACTION: "*.action",  // Matches [any service].action
    ANY_USER_EVENT: "user.*",  // Matches user.created, user.deleted, etc.
    ANY_COURSE_EVENT: "course.*",  // Matches course.created, course.updated, etc.
    ANY_EVENT_FROM_USER_SERVICE: "user_service.#",  // All events from user_service
    ANY_EVENT_FROM_COURSE_SERVICE: "course_service.#", // All events from course_service
};

module.exports = { RoutingKeys };
