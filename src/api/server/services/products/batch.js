"use strict"

const path = require("path")
const url = require("url")
const settings = require("../../lib/settings")
const mongo = require("../../lib/mongo")
const parse = require("../../lib/parse")
const ObjectID = require("mongodb").ObjectID
const fse = require("fs-extra")
const FileSystemService = require("./fileSystem")
const CloudinaryService = require("./cloudinary")
const AWS = require("aws-sdk")
const uuid = require("uuid/v1")
const ProductBatchDeleteQueue = require("../../../../queue/ProductBatchDeleteQueue")

const S3 = new AWS.S3({
  accessKeyId:     settings.bucketeerAWSAccessKeyId,
  secretAccessKey: settings.bucketeerAWSSecretAccessKey,
  region:          settings.bucketeerAWSRegion,
})

class BatchUploadService {
  constructor() {
    this.BATCH_ACTION = {
      CREATE_PRODUCTS: "create_products",
      DELETE_PRODUCTS: "delete_products",
    }
  }

  getErrorMessage(err) {
    return { "error": true, "message": err.toString() }
  }

  async getBatchList(req, res) {
    try {
      const batchList = await mongo.db.collection("batch").find().toArray()
      res.status(200).send(batchList)
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error))
    }
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
        status:         "queued",
        action:         batchAction,
        error_message:  null,
        date_parsed:    null,
        date_started:   null,
        date_stopped:   null,
        date_completed: null,
        date_uploaded:  new Date(),
      }
      const inserted = await mongo.db.collection("batch").insertOne(batchRecord)

      // Publish message to queue
      await ProductBatchDeleteQueue.publish(inserted.insertedId.toString())

      res.status(200).send(batchRecord)
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error))
    }
  }

  async setDateStartedByObjectID(batchObjectID) {
    try {
      await mongo.db.collection("batch").updateOne({ _id: batchObjectID }, { $set: { date_started: new Date() } })
    } catch (err) {
      throw this.getErrorMessage(err)
    }
  }

  async setDateStoppedByObjectID(batchObjectID) {
    try {
      await mongo.db.collection("batch").updateOne({ _id: batchObjectID }, { $set: { date_stopped: new Date() } })
    } catch (err) {
      throw this.getErrorMessage(err)
    }
  }

  async setDateParsedByObjectID(batchObjectID) {
    try {
      await mongo.db.collection("batch").updateOne({ _id: batchObjectID }, { $set: { date_parsed: new Date() } })
    } catch (err) {
      throw this.getErrorMessage(err)
    }
  }

  async setDateCompletedByObjectID(batchObjectID) {
    try {
      await mongo.db.collection("batch").updateOne({ _id: batchObjectID }, { $set: { date_completed: new Date() } })
    } catch (err) {
      throw this.getErrorMessage(err)
    }
  }
}

module.exports = new BatchUploadService()
