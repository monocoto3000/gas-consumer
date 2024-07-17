import * as amqp from "amqplib/callback_api";
const socketIoClient = require("socket.io-client");
import { Socket } from "socket.io-client";

const USERNAME = "protectify"
const PASSWORD = encodeURIComponent("Contraseña")
const HOSTNAME = "IP"
const PORT = 5672
const RABBITMQ_QUEUE_DATA = "gas";
const WEBSOCKET_SERVER_URL = "url del ws server";

let socketIO: Socket;

async function connect() {
  try {
    amqp.connect(`amqp://${USERNAME}:${PASSWORD}@${HOSTNAME}:${PORT}`, (err: any, conn: amqp.Connection) => {
      if (err) throw new Error(err);

      conn.createChannel((errChanel: any, channel: amqp.Channel) => {
        if (errChanel) throw new Error(errChanel);

        channel.assertQueue(RABBITMQ_QUEUE_DATA, {durable:true, arguments:{"x-queue-type":"quorum"}});

        channel.consume(RABBITMQ_QUEUE_DATA, (data: amqp.Message | null) => {
          if (data?.content !== undefined) {
            const parsedContent = JSON.parse(data.content.toString());
            console.log("Datos de gas:", parsedContent);
            socketIO.emit("gasData", parsedContent);
            channel.ack(data);
          }
        });

        socketIO = socketIoClient(WEBSOCKET_SERVER_URL);
      });
    });
  } catch (err: any) {
    throw new Error(err);
  }
}

connect();