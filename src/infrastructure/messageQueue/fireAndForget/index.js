const RabbitMQClient = require("./client");

(async () => {
    try {
        // Initialize RabbitMQ client
        await RabbitMQClient.initialize();
        console.log("RabbitMQ client is running...");

        // Send a test message
        const testPayload = { userId: "12345", action: "course_enrolled" };
        // await RabbitMQClient.produce("course_task_queue", testPayload);

        //onsole.log("Message sent successfully!");

    } catch (error) {
        console.error("Error starting RabbitMQ client:", error);
    }
})();
