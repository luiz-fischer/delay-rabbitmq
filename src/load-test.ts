import express from 'express';
import amqp, { Channel } from 'amqplib'; // Import Channel type

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
const responseQueue = 'response_queue'; // The queue for receiving the response
const numMessages = 100;

let channel: Channel; // Declare channel with its proper type

async function sendMessagesToRabbitMQ() {
  const queueOptions = {
    durable: true,
  };

  await channel.assertQueue(queue, queueOptions);
  await channel.assertQueue(responseQueue, queueOptions);

  for (let i = 1; i <= numMessages; i++) {
    const message = {
      id: i,
      content: `Message ${i}`,
    };
    const messageContent = JSON.stringify(message);

    const msgOptions = {
      persistent: true,
    };

    channel.sendToQueue(queue, Buffer.from(messageContent), msgOptions);
    console.log(`Message ${messageContent} sent to RabbitMQ and awaiting processing confirmation...`);
  }

  channel.consume(responseQueue, (msg) => {
    if (msg !== null) {
      console.log(`Received confirmation: ${msg.content.toString()}`);
      channel.ack(msg);
    }
  });
}

async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect(rabbitMQConfig);
    channel = await connection.createChannel();
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}

connectToRabbitMQ().then(() => {
  sendMessagesToRabbitMQ();
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
