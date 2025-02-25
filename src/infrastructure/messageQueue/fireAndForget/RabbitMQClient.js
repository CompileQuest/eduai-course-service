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

        // Automatically initialize the connection when the class is instantiated
        this.initialize().then(() => {
            console.log("RabbitMQ client initialized automatically.");
        }).catch((error) => {
            console.error("Failed to initialize RabbitMQ client:", error);
        });

        RabbitMQClient.instance = this;
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
            console.log("RabbitMQ client initialized successfully.");
        } catch (error) {
            console.error("RabbitMQ error:", error);
            throw error; // Re-throw the error to handle it outside
        }
    }

    async produce(queueName, data) {
        if (!this.isInitialized) {
            throw new Error("RabbitMQ client is not initialized.");
        }
        const message = new Message("test", "course-service", data);
        return await this.producer.produceMessage(queueName, message);
    }
}

// Create and export a single instance of RabbitMQClient
const rabbitMQClient = new RabbitMQClient();
module.exports = rabbitMQClient;