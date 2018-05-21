'use strict';

const path = require('path');
const url = require('url');
const settings = require('../../lib/settings');
const mongo = require('../../lib/mongo');
const parse = require('../../lib/parse');
const ObjectID = require('mongodb').ObjectID;
const fse = require('fs-extra');
const FileSystemService = require('./fileSystem');
const CloudinaryService = require('./cloudinary');
const AWS = require('aws-sdk');
const uuid = require('uuid/v1');

const S3  = new AWS.S3({
  accessKeyId: settings.bucketeerAWSAccessKeyId,
  secretAccessKey: settings.bucketeerAWSSecretAccessKey,
  region: settings.bucketeerAWSRegion,
});

class BatchUploadService {
  constructor() {}

  getErrorMessage(err) {
    return { 'error': true, 'message': err.toString() };
  }

  async getBatchList(req, res) {
    try {
      const batchList = await mongo.db.collection('batch').find().toArray();
      res.status(200).send(batchList);
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error));
    }
  }

  async getBatchItem(req, res) {
    const batchId = req.params.batchId;
    if(!ObjectID.isValid(batchId)) {
      return Promise.reject('Invalid identifier');
    }

    try {
      const batchObjectID = new ObjectID(batchId);
      const batchItem = await mongo.db.collection('batch').findOne({ _id: batchObjectID });
      res.status(200).send(batchItem);
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error));
    }
  }

  async uploadFile(req, res) {

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const fileExtension = fileName.split('.').pop();
    const fileSize = req.file.size;
    const fileKey = uuid() + '.' + fileExtension;

    const params = {
      Key:    fileKey,
      Bucket: settings.bucketeerBucketName,
      Body:   fileBuffer,
      ACL: 'public-read'
    };

    try {
      const uploadedFile = await S3.upload(params).promise();
      const batchRecord = {
        file_name: fileName,
        file_key: fileKey,
        file_size: fileSize,
        file_url: uploadedFile.Location,
        status: 'queued',
        error_message: null,
        date_parsed: null,
        date_started: null,
        date_stopped: null,
        date_completed: null,
        date_uploaded: new Date()
      };
      await mongo.db.collection('batch').insertOne(batchRecord);
      res.status(200).send(batchRecord);
    } catch(error) {
      res.status(500).send(this.getErrorMessage(error));
    }
  }
}

module.exports = new BatchUploadService();
