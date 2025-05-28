/**
 * @file kafka-test-api.js
 * @description A simple Node.js script demonstrating the use of the
 * @confluentinc/kafka-javascript package with its Promisified API.
 * This script acts as both a producer and a consumer for a given Kafka topic.
 *
 * NOTE: This script requires a running Kafka broker to connect to.
 * Replace 'localhost:9092' with your actual Kafka bootstrap servers.
 */

// Import the Kafka client from the package
// The Kafka constructor is nested under the 'KafkaJS' property for @confluentinc/kafka-javascript
const { Kafka } = require('@confluentinc/kafka-javascript').KafkaJS;

// --- Configuration ---
// Replace with your Kafka broker address(es)
// Changed localhost:9092 to kafka:9092 as requested
const BOOTSTRAP_SERVERS = process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092';
const TOPIC_NAME = 'my-test-topic';
const CONSUMER_GROUP_ID = 'my-test-group';

/**
 * Main asynchronous function to run the Kafka producer and consumer logic.
 */
async function runKafkaTest() {
    console.log(`Attempting to connect to Kafka at: ${BOOTSTRAP_SERVERS}`);

    // Create a new Kafka client instance
    // The 'brokers' property and 'clientId' must be moved into a 'kafkaJS' block
    const client = new Kafka({
        kafkaJS: { // <-- Added kafkaJS block for top-level Kafka client configuration
            brokers: [BOOTSTRAP_SERVERS],
            // Optional: Client ID for logging and tracing purposes
            clientId: 'kafka-js-test-api',
        }, // <-- Closed kafkaJS block
    });

    let producer;
    let consumer;

    try {
        // --- Producer Logic ---
        console.log('\n--- Starting Producer ---');
        // Create a producer instance. The .producer() method returns a Promise.
        producer = client.producer();

        // Connect the producer to the Kafka cluster. This is an asynchronous operation.
        await producer.connect();
        console.log('Producer connected successfully.');

        const message = {
            key: 'testKey',
            value: `Hello Kafka from Node.js at ${new Date().toISOString()}`,
        };

        // Send a message to the specified topic. The .send() method returns a Promise.
        // The 'messages' property is an array, allowing multiple messages to be sent in one go.
        const deliveryReports = await producer.send({
            topic: TOPIC_NAME,
            messages: [message],
        });

        console.log(`Message sent to topic '${TOPIC_NAME}':`);
        console.log(`   Key: ${message.key}`);
        console.log(`   Value: ${message.value}`);
        console.log('Delivery Reports:', deliveryReports);
        console.log('Producer finished sending message.');

        // Disconnect the producer. This is good practice to free up resources.
        await producer.disconnect();
        console.log('Producer disconnected.');

        // Give a moment for the message to be available for consumption
        await new Promise(resolve => setTimeout(resolve, 2000));

        // --- Consumer Logic ---
        console.log('\n--- Starting Consumer ---');
        // Create a consumer instance. The .consumer() method returns a Promise.
        // The 'groupId' and 'fromBeginning' properties must be within a 'kafkaJS' block for the consumer,
        // while 'enable.auto.commit' and 'auto.commit.interval.ms' are direct librdkafka-style properties.
        consumer = client.consumer({
            kafkaJS: { // KafkaJS specific consumer options
                groupId: CONSUMER_GROUP_ID,
                // 'fromBeginning' must be passed to the consumer during creation
                fromBeginning: true,
            },
            // librdkafka specific options for auto-commit, directly at the consumer config level
            'enable.auto.commit': true,
            'auto.commit.interval.ms': 5000,
        });

        // Connect the consumer to the Kafka cluster.
        await consumer.connect();
        console.log('Consumer connected successfully.');

        // Subscribe to the topic. 'fromBeginning' is now part of the consumer's creation config.
        await consumer.subscribe({
            topic: TOPIC_NAME,
            // fromBeginning: true, // This is no longer needed here
        });
        console.log(`Consumer subscribed to topic '${TOPIC_NAME}'.`);

        // Start consuming messages. The .run() method sets up a continuous polling loop.
        // It takes an object with a 'eachMessage' async function to process each message.
        console.log('Consumer is now running and waiting for messages...');
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(`\n--- Received Message ---`);
                console.log(`   Topic: ${topic}`);
                console.log(`   Partition: ${partition}`);
                console.log(`   Offset: ${message.offset}`);
                console.log(`   Key: ${message.key ? message.key.toString() : 'null'}`);
                console.log(`   Value: ${message.value ? message.value.toString() : 'null'}`);
                console.log(`   Timestamp: ${message.timestamp}`);
                // For demonstration, we'll stop after receiving one message.
                // In a real application, you'd process messages continuously.
                console.log('Message processed. Disconnecting consumer...');
                await consumer.disconnect();
                console.log('Consumer disconnected.');
                // Exit the process after successful consumption and disconnection
                process.exit(0);
            },
        });

    } catch (error) {
        console.error('An error occurred during Kafka operations:', error);
        // Attempt to disconnect if producer or consumer were initialized
        if (producer) {
            try {
                await producer.disconnect();
                console.log('Producer disconnected due to error.');
            } catch (e) {
                console.error('Error disconnecting producer:', e);
            }
        }
        if (consumer) {
            try {
                await consumer.disconnect();
                console.log('Consumer disconnected due to error.');
            } catch (e) {
                console.error('Error disconnecting consumer:', e);
            }
        }
        process.exit(1); // Exit with an error code
    }
}

// Call the main function to start the Kafka test
runKafkaTest();
