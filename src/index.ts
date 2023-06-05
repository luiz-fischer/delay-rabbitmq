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

const queue = 'delayed_queue';
const responseQueue = 'response_queue';

let channel;

const processQueue = async () => {
  try {
    const connection = await amqp.connect(rabbitMQConfig);
    channel = await connection.createChannel();

    channel.prefetch(10, true);

    await channel.assertQueue(queue, { durable: true });
    await channel.assertQueue(responseQueue, { durable: true }); // Assert the response queue

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

const delay = (duration) => new Promise((resolve) => setTimeout(resolve, 5000));

const processMessage = async (message) => {
  console.log(`Processing message ${message}`);

  try {
    if (Math.random() < 0.1) {
      throw new Error('Failed processing')
    }
    await delay(2000);

    console.log(`Completed processing message ${message}`);
    sendConfirmation(message);
  } catch (error) {
    console.error('Error processing message:', error);
  }
};

const sendConfirmation = (message) => {
  const confirmationMessage = `Message ${message} processed successfully.`;
  const msgOptions = {
    persistent: true,
  };
  
  console.log('Sending confirmation to RabbitMQ:', confirmationMessage);
  channel.sendToQueue(responseQueue, Buffer.from(confirmationMessage), msgOptions); // Send confirmation to the response queue
}

processQueue();


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
