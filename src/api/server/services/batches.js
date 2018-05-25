"use strict"

const url = require("url")
const settings = require("../lib/settings")
const mongo = require("../lib/mongo")
const parse = require("../lib/parse")
const ObjectID = require("mongodb").ObjectID
const AWS = require("aws-sdk")
const uuid = require("uuid/v1")
const { Queue } = require("../../../queue/Queue")

const S3 = new AWS.S3({
  accessKeyId:     settings.bucketeerAWSAccessKeyId,
  secretAccessKey: settings.bucketeerAWSSecretAccessKey,
  region:          settings.bucketeerAWSRegion,
})

class BatchUploadService {
  constructor() {
    this.BATCH_STATUS = {
      QUEUED:    "queued",
      STARTED:   "started",
      PARSED:    "parsed",
      ABORTED:   "aborted",
      COMPLETED: "completed",
    }
  }

  getErrorMessage(err) {
    return { "error": true, "message": err.toString() }
  }

  async getBatchItemList(action = null) {
    const filter = {}
    if (action !== null) {
      filter.action = action
    }
    return await mongo.db.collection("batch").find(filter).toArray()
  }

  async getBatchItemByObjectID(batchObjectID) {
    return await mongo.db.collection("batch").findOne({ _id: batchObjectID })
  }

  async uploadFile(req, res, batchAction) {

    const fileBuffer = req.file.buffer
    const fileName = req.file.originalname
    const fileExtension = fileName.split(".").pop()
    const fileSize = req.file.size
    const fileKey = uuid() + "." + fileExtension

    const params = {
      Key:    fileKey,
      Bucket: settings.bucketeerBucketName,
      Body:   fileBuffer,
      ACL:    "public-read",
    }

    try {
      const uploadedFile = await S3.upload(params).promise()
      const batchRecord = {
        file_name:      fileName,
        file_key:       fileKey,
        file_size:      fileSize,
        file_url:       uploadedFile.Location,
        status:         this.BATCH_STATUS.QUEUED,
        action:         batchAction,
        errors:         [],
        date_started:   null,
        date_parsed:    null,
        date_aborted:   null,
        date_completed: null,
        date_uploaded:  new Date(),
      }
      const inserted = await mongo.db.collection("batch").insertOne(batchRecord)

      // Publish message to queue
      await Queue.shared.publishMessageToQueue(batchAction, { batchID: inserted.insertedId.toString() })

      res.status(200).send(batchRecord)
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error))
    }
  }

  async update(batchObjectID, data) {
    try {
      await mongo.db.collection("batch").updateOne({ _id: batchObjectID }, { $set: data })
    } catch (err) {
      throw this.getErrorMessage(err)
    }
  }

}

module.exports = new BatchUploadService()
