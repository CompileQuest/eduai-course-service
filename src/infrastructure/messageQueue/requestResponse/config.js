// config.js
module.exports = {
    rabbitMQ: {
        url: "amqp://mohd:mohd@localhost",
        queues: {
            rpcQueue: "user-to-auth-queue",
        },
    },
};