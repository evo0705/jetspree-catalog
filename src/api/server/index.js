require('dotenv').config();

const express = require("express")
const app = express()
const helmet = require("helmet")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const responseTime = require("response-time")
const winston = require("winston")
const logger = require("./lib/logger")
const settings = require("./lib/settings")
const security = require("./lib/security")
const mongo = require("./lib/mongo")
const dashboardWebSocket = require("./lib/dashboardWebSocket")
const ajaxRouter = require("./ajaxRouter")
const apiRouter = require("./apiRouter")
const cors = require("cors")
const { Queue } = require("../../queue/Queue")

security.applyMiddleware(app)
app.set("trust proxy", 1)
app.use(helmet())
app.all("*", (req, res, next) => {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Key, Authorization")
  next()
})

Queue.init().catch()

// Setup CORS
const corsWhitelist = security.getAccessControlAllowOrigin()
if (corsWhitelist !== "*") {
  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || corsWhitelist.split(",").indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
  }
  app.use(cors(corsOptions))
  app.options("*", cors(corsOptions))
}

app.use(responseTime())
app.use(cookieParser(settings.cookieSecretKey))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use("/ajax", ajaxRouter)
app.use("/api", apiRouter)
app.use(logger.sendResponse)

const server = app.listen(settings.apiListenPort, () => {
  const serverAddress = server.address()
  winston.info(`API running at http://localhost:${serverAddress.port}`)
})

dashboardWebSocket.listen(server)
