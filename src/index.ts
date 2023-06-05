import express, { Request, Response } from 'express'
import amqp from 'amqplib'

const app = express()
app.use(express.json())

const rabbitMQConfig = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  username: 'guest',
  password: 'guest',
}

const exchange = 'my_delayed_exchange';
const queue = 'my_delayed_queue';
const routingKey = 'testKey';

let channel; // declare channel here

const processQueue = async () => {
  try {
    const connection = await amqp.connect(rabbitMQConfig)
    channel = await connection.createChannel()

    // Limit the number of unacknowledged messages to 1.
    channel.prefetch(1);

    // Define the options for the exchange.
    const exchangeOptions = {
      arguments: { 'x-delayed-type': 'direct' },
      durable: true
    };

    await channel.assertExchange(exchange, 'x-delayed-message', exchangeOptions);
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    console.log('Waiting for messages...');

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        console.log(`Received '${msg.content.toString()}'`);
        const startTime = Date.now(); // get the start time
        await processMessage(msg.content.toString());
        const endTime = Date.now(); // get the end time
        console.log(`Delay: ${endTime - startTime} ms`); // log the delay

        // Acknowledge the message
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error consuming messages:', error);
  }
}

const processMessage = async (message: string) => {
  console.log(`Processing message ${message}`)

  try {
    // Simulate message processing
    await new Promise((resolve) => setTimeout(resolve, 5000))

    console.log(`Completed processing message ${message}`)
  } catch (error) {
    console.error(`Error processing message:`, error)

    // Define the options for the message. The 'expiration' field is
    // used to set the delay (in milliseconds).
    const msgOptions = {
      headers: { 'x-delay': 10000 }, // Delay of 10 seconds
      persistent: true
    };

    console.log('Sending message back to RabbitMQ:', message)
    channel.publish(exchange, routingKey, Buffer.from(message), msgOptions);
  }
}

processQueue()

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
