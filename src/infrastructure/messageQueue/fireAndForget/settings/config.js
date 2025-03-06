const { RABBITMQ_URL, SERVICE_NAME } = require('../../../../config/index');
const bindingsConfig = require("./bindingsConfig");

console.log(SERVICE_NAME);
module.exports = {
    rabbitMQ: {
        url: RABBITMQ_URL,
        exchange: bindingsConfig[SERVICE_NAME].exchange,
        queue: bindingsConfig[SERVICE_NAME].queue,
        bindings: bindingsConfig[SERVICE_NAME].bindings,
    },
};
