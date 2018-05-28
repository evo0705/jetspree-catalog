const amqplib = require("amqplib")

const RABBITMQ_UNSET = "not_set"
const { RABBITMQ_BIGWIG_URL = RABBITMQ_UNSET, MODE } = process.env

if (RABBITMQ_BIGWIG_URL === RABBITMQ_UNSET && MODE === "production") {
  console.error("$RABBITMQ_BIGWIG_URL must be set in production")
  process.exit()
}

const QUEUE_NAMES = {
  BULK_PRODUCT_DELETE: "bulk_product_delete",
  BULK_PRODUCT_UPLOAD: "bulk_product_upload",
}

let sharedInstance

class Queue {

  constructor(connection) {
    this.connection = connection
  }

  static async init() {
    // Read connection string
    if (RABBITMQ_BIGWIG_URL === RABBITMQ_UNSET) {
      console.log("$RABBITMQ_BIGWIG_URL is not set")
    }

    // Connect to queue
    const connection = await amqplib.connect(RABBITMQ_BIGWIG_URL)

    // Init Queue
    sharedInstance = new Queue(connection)
  }

  static get shared() {
    if (sharedInstance === undefined) {
      console.error("Queue has not been initialized yet!")
      process.exit()
    }

    return sharedInstance
  }

  async publishMessageToQueue(queueName, data) {
    try {
      // Prepare channel and queue
      const channel = await this.connection.createChannel()
      channel.assertQueue(queueName)

      // Prepare data
      const dataString = JSON.stringify(data)

      // Publish to queue
      await channel.sendToQueue(queueName, Buffer(dataString))
    } catch (err) {
      console.error(`Couldn't publish message to queue ${queueName}`, err)
    }
  }

  async consumeMessagesFromQueue(queueName, withHandlerFunc) {
    try {
      // Prepare channel and queue
      const channel = await this.connection.createChannel()
      channel.assertQueue(queueName)

      // Subscribe to queue
      console.log(`Worker | ${queueName} | Starting...`)
      const res = await channel.consume(queueName, async (msg) => {
        if (msg === null) {
          console.error("The message is null. Why?")
          return
        }

        // Unpack data
        const dataString = msg.content.toString()
        const data = JSON.parse(dataString)

        // Run subscribing function
        let messageResponse = await withHandlerFunc(data)

        // Handle message acknowledgement
        if (messageResponse.success) {
          channel.ack(msg)
          console.log(`Worker | ${queueName} | Success: ${messageResponse.message}`)
        } else if (messageResponse.requeue) {
          channel.nack(msg, null, true)
          console.log(`Worker | ${queueName} | Error (will retry): ${messageResponse.message}`)
        } else {
          channel.nack(msg, null, false)
          console.log(`Worker | ${queueName} | Error (final): ${messageResponse.message}`)
        }
      })

      return res
    } catch (err) {
      // Throw so the worker supervisor can restart this queue
      throw(`Worker | ${queueName} | Fatal Error : ${err}`)
    }
  }

}

module.exports = {
  Queue,
  QUEUE_NAMES,
}
