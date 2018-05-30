"use strict"

import settings from"../lib/settings"
import mongo from"../lib/mongo"
import AWS from"aws-sdk"
import uuid from"uuid/v1"
import ProductBatchUploadQueue from "../../../queue/ProductBatchUploadQueue"
import ProductBatchDeleteQueue from "../../../queue/ProductBatchDeleteQueue"

const S3 = new AWS.S3({
  accessKeyId:     settings.bucketeerAWSAccessKeyId,
  secretAccessKey: settings.bucketeerAWSSecretAccessKey,
  region:          settings.bucketeerAWSRegion,
})

export const BATCH_ACTION = {
  CREATE_PRODUCTS: "create_products",
  DELETE_PRODUCTS: "delete_products",
}

export const BATCH_STATUS = {
  QUEUED:    "queued",
  STARTED:   "started",
  PARSED:    "parsed",
  ABORTED:   "aborted",
  COMPLETED: "completed",
}

export default class BatchUploadService {

  getErrorMessage(err) {
    return { "error": true, "message": err.toString() }
  }

  static async getBatchItemList(action = null, query = {}) {
    const filter = {}
    const sortBy = {}

    if (action !== null) {
      filter.action = action
    }

    if(query.sortField !== undefined && query.sortType !== undefined) {
      sortBy[query.sortField] = Number(query.sortType)
    }

    return await mongo.db.collection("batch").find(filter).sort(sortBy).toArray()
  }

  static async getBatchItemByObjectID(batchObjectID) {
    return await mongo.db.collection("batch").findOne({ _id: batchObjectID })
  }

  static async uploadFile(req, res, batchAction) {

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
        status:         BATCH_STATUS.QUEUED,
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
      switch (batchAction){
        case BATCH_ACTION.CREATE_PRODUCTS:
          await ProductBatchUploadQueue.publish(inserted.insertedId.toString())
          break
        case BATCH_ACTION.DELETE_PRODUCTS:
          await ProductBatchDeleteQueue.publish(inserted.insertedId.toString())
          break
      }

      res.status(200).send(batchRecord)
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error))
    }
  }

  static async update(batchObjectID, data) {
    try {
      await mongo.db.collection("batch").updateOne({ _id: batchObjectID }, { $set: data })
    } catch (err) {
      throw this.getErrorMessage(err)
    }
  }

}
