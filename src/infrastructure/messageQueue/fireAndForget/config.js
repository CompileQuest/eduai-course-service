const { ConsumerQueues } = require('./queues/consumerQueues')
const { ProducerQueues } = require('./queues/producerQueues');
const { RABBITMQ_URL } = require('../../../config/index');
module.exports = {
    rabbitMQ: {
        url: RABBITMQ_URL,// Change to your RabbitMQ server URL
        queues: Object.values(ConsumerQueues), // Use consumer queues
    },
    ConsumerQueues, // Export consumer queues for reuse
    ProducerQueues
};