import express from 'express';
import amqp from 'amqplib';

const app = express();
app.use(express.json());

const rabbitMQConfig = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  username: 'guest',
  password: 'guest',
};

const exchange = 'my_delayed_exchange';
const queue = 'my_delayed_queue';
const routingKey = 'test.*'; // Pattern for topic-based routing

let channel;

const processQueue = async () => {
  try {
    const connection = await amqp.connect(rabbitMQConfig);
    channel = await connection.createChannel();

    // channel.prefetch(10, false); // Definir prefetch count de 10 apenas para o consumidor atual
    channel.prefetch(10, true); // Definir prefetch count de 10 globalmente para todos os consumidores no canal

    const exchangeOptions = {
      durable: true,
    };

    await channel.assertExchange(exchange, 'topic', exchangeOptions);
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    console.log('Waiting for messages...');

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        console.log(`Received '${msg.content.toString()}'`);
        await processMessage(msg.content.toString());

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error consuming messages:', error);
  }
};

const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const processMessage = async (message) => {
  console.log(`Processing message ${message}`);

  try {
    if (Math.random() < 0.5) {
      throw new Error('Failed processing')
    }
    await delay(2000); // Simulate an asynchronous process with a delay

    console.log(`Completed processing message ${message}`);
  } catch (error) {
    console.error('Error processing message:', error);

    const msgOptions = {
      headers: { 'x-delay': 5000 },
      persistent: true,
    };

    console.log('Sending message back to RabbitMQ:', message);
    channel.publish(exchange, routingKey, Buffer.from(message), msgOptions);
  }
};

processQueue();

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
