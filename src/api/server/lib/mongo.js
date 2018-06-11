import { mongodbServerUrl } from "./settings"
import winston from "winston"
import { MongoClient } from "mongodb"

const lastSlashIndex = mongodbServerUrl.lastIndexOf("/")
const queryStartIndex = mongodbServerUrl.lastIndexOf("?")
const dbName = mongodbServerUrl.substring(lastSlashIndex + 1, queryStartIndex)

const RECONNECT_INTERVAL = 1000
const CONNECT_OPTIONS = {
  reconnectTries:    3600,
  reconnectInterval: RECONNECT_INTERVAL,
}

const onClose = () => {
  winston.info("MongoDB connection was closed")
}

const onReconnect = () => {
  winston.info("MongoDB reconnected")
}

const connectWithRetry = () => {
  MongoClient.connect(mongodbServerUrl, CONNECT_OPTIONS, (err, client) => {
    if (err) {
      winston.error("MongoDB connection was failed:", err.message)
      setTimeout(connectWithRetry, RECONNECT_INTERVAL)
    } else {
      const db = client.db(dbName)
      db.on("close", onClose)
      db.on("reconnect", onReconnect)
      module.exports.db = db
      winston.info("MongoDB connected successfully")
    }
  })
}

connectWithRetry()
