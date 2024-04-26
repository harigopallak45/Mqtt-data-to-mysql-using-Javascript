import mqtt, { MqttClient } from 'mqtt';
import { PrismaClient } from '@prisma/client';

// MQTT broker URL
const brokerUrl: string = 'mqtt://broker.emqx.io';

// Topic to subscribe to
const topic: string = 'test/12333';

// Prisma client
const prisma: PrismaClient = new PrismaClient();

// Connect to the MQTT broker
const client: MqttClient = mqtt.connect(brokerUrl);

// MQTT client connected event
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to topic:', topic);
    }
  });
});

// MQTT message received event
client.on('message', async (mqttTopic: string, message: Buffer) => {
  console.log('Received message on topic', mqttTopic, ':', message.toString());

  try {
    // Parse the incoming message
    const data = JSON.parse(message.toString());

    // Extract barcode and timestamp from the message
    const { barcode, timestamp } = data;

    // Save the data to the database using Prisma
    await prisma.barcode_data.create({
      data: {
        barcode: barcode,
        createdAt: new Date(timestamp),
      },
    });
    console.log('Data saved to database');
  } catch (error) {
    console.error('Error saving data to database:', error);
  }
});

// MQTT error event
client.on('error', (error: Error) => {
  console.error('MQTT error:', error);
});
