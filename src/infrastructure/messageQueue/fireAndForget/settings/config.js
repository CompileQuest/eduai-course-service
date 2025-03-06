const { RABBITMQ_URL } = require('../../../../../config/index');
const bindingsConfig = require("./bindingsConfig");
const serviceName = "user_service"; // Change per service
module.exports = {
    rabbitMQ: {
        url: RABBITMQ_URL,
        exchange: bindingsConfig[serviceName].exchange,
        queue: bindingsConfig[serviceName].queue,
        bindings: bindingsConfig[serviceName].bindings,
    },
};
