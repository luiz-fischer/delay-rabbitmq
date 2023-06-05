import amqp from 'amqplib';

const rabbitMQConfig = {
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  username: 'guest',
  password: 'guest',
};

const exchange = 'my_delayed_exchange';
const routingKey = 'test.message'; // Adjust the routing key according to your setup

const numMessages = 100; // Define the number of messages to publish

async function publishMessagesToRabbitMQ() {
  try {
    const connection = await amqp.connect(rabbitMQConfig);
    const channel = await connection.createConfirmChannel();

    const exchangeOptions = {
      durable: true,
    };

    await channel.assertExchange(exchange, 'topic', exchangeOptions);

    for (let i = 1; i <= numMessages; i++) {
      const message = {
        id: i,
        content: `Message ${i}`,
      };
      const messageContent = JSON.stringify(message);

      const msgOptions = {
        persistent: true,
      };

      channel.publish(exchange, routingKey, Buffer.from(messageContent), msgOptions);

      await channel.waitForConfirms();

      console.log('Message published to RabbitMQ:', messageContent);
    }

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error publishing messages to RabbitMQ:', error);
  }
}

publishMessagesToRabbitMQ();
