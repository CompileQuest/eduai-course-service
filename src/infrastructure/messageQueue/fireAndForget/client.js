const { connect } = require("amqplib");
const config = require("./config");
const Consumer = require("./consumer");
const Producer = require("./producer");
const Message = require("./messageTemplate");

class RabbitMQClient {
    constructor() {
        if (RabbitMQClient.instance) {
            return RabbitMQClient.instance;
        }

        this.isInitialized = false;
        this.producer = null;
        this.consumer = null;
        this.connection = null;
        this.producerChannel = null;
        this.consumerChannel = null;

        RabbitMQClient.instance = this;
    }

    static getInstance() {
        if (!RabbitMQClient.instance) {
            RabbitMQClient.instance = new RabbitMQClient();
        }
        return RabbitMQClient.instance;
    }

    async initialize() {
        if (this.isInitialized) {
            console.log("RabbitMQ client is already initialized.");
            return;
        }

        try {
            this.connection = await connect(config.rabbitMQ.url);
            this.producerChannel = await this.connection.createChannel();
            this.consumerChannel = await this.connection.createChannel();

            // Assert multiple queues
            const Queues = [];
            for (const queueName of config.rabbitMQ.queues) {
                const { queue } = await this.consumerChannel.assertQueue(queueName, { durable: true });
                Queues.push(queue);
            }

            this.producer = new Producer(this.producerChannel);
            this.consumer = new Consumer(this.consumerChannel, Queues);

            this.consumer.consumeMessages();

            this.isInitialized = true;
            console.log("RabbitMQ client initialized.");

        } catch (error) {
            console.error("RabbitMQ error:", error);
        }
    }

    async produce(queueName, data) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        const message = new Message("test", "course-service", data);
        return await this.producer.processMessage(queueName, message);
    }
}

module.exports = RabbitMQClient.getInstance();
