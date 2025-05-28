# kafka-javascript-test

The kafka-test-api.js script acts as both a producer and a consumer. 
It first sets up a connection to the Kafka server in the container and then sends a message to a topic. After confirming the message was sent, it switches roles to a consumer, connects to the same Kafka topic, and waits to receive the message. Once the message is consumed, the script cleanly disconnects from Kafka and finishes.

example output:
```root@23cb0225c18c:/app# node kafka-test-api.js
Attempting to connect to Kafka at: kafka:9092

--- Starting Producer ---
{
  message: 'Producer connected',
  name: 'kafka-js-test-api#producer-1',
  fac: 'BINDING',
  timestamp: 1748462718924
}
Producer connected successfully.
Message sent to topic 'my-test-topic':
   Key: testKey
   Value: Hello Kafka from Node.js at 2025-05-28T20:05:18.925Z
Delivery Reports: [
  {
    topicName: 'my-test-topic',
    partition: 0,
    errorCode: 0,
    baseOffset: '3',
    logAppendTime: '-1',
    logStartOffset: '0'
  }
]
Producer finished sending message.
{
  message: 'Producer disconnected',
  name: 'kafka-js-test-api#producer-1',
  fac: 'BINDING',
  timestamp: 1748462718935
}
Producer disconnected.

--- Starting Consumer ---
{
  message: 'Consumer connected',
  name: 'kafka-js-test-api#consumer-2',
  fac: 'BINDING',
  timestamp: 1748462721009
}
Consumer connected successfully.
Consumer subscribed to topic 'my-test-topic'.
Consumer is now running and waiting for messages...
{
  message: "Received rebalance event with message: 'Local: Assign partitions' and 1 partition(s), isLost: false",
  name: 'kafka-js-test-api#consumer-2',
  fac: 'BINDING',
  timestamp: 1748462725005
}

--- Received Message ---
   Topic: my-test-topic
   Partition: 0
   Offset: 0
   Key: testKey
   Value: Hello Kafka from Node.js at 2025-05-28T19:56:29.353Z
   Timestamp: 1748462189354
Message processed. Disconnecting consumer...
{
  message: "Received rebalance event with message: 'Local: Revoke partitions' and 1 partition(s), isLost: false",
  name: 'kafka-js-test-api#consumer-2',
  fac: 'BINDING',
  timestamp: 1748462725143
}
{
  message: 'Consumer disconnected',
  name: 'kafka-js-test-api#consumer-2',
  fac: 'BINDING',
  timestamp: 1748462725147
}
Consumer disconnected.
