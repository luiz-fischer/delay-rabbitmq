import amqp, { ConfirmChannel } from 'amqplib'

async function main() {
  const numMessages = 10 // Altere o valor para o número desejado de mensagens

  await publishMessagesToRabbitMQ(numMessages)
}

main().catch((error) => console.error('Error:', error))

async function publishMessagesToRabbitMQ(numMessages: number) {
  try {
    const rabbitMQConfig = {
      protocol: 'amqp',
      hostname: 'localhost',
      port: 5672,
      username: 'guest',
      password: 'guest',
    }

    const connection = await amqp.connect(rabbitMQConfig)
    const channel = await connection.createConfirmChannel() as ConfirmChannel

    const exchange = 'my_delayed_exchange';
    const queue = 'my_delayed_queue';
    const routingKey = 'testKey';
  
    const exchangeOptions = {
      arguments: { 'x-delayed-type': 'direct' },
      durable: true
    };

    await channel.assertExchange(exchange, 'x-delayed-message', exchangeOptions);
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    for (let i = 1; i <= numMessages; i++) {
      const message = {
        id: i,
        content: `Message ${i}`,
      }
      const messageContent = JSON.stringify(message)
      
      // Define the options for the message. The 'x-delay' field is
      // used to set the delay (in milliseconds).
      const msgOptions = {
        headers: { 'x-delay': 5000 }, // Delay of 5 seconds
        persistent: true
      };

      channel.publish(exchange, routingKey, Buffer.from(messageContent), msgOptions);

      await channel.waitForConfirms() // Wait for message confirmation

      console.log('Message published to RabbitMQ:', messageContent)
    }

    await channel.close()
    await connection.close()
  } catch (error) {
    console.error('Error publishing messages to RabbitMQ:', error)
  }
}
