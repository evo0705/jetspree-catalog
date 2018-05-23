'use strict';

const path = require('path');
const url = require('url');
const settings = require('../../lib/settings');
const utils = require('../../lib/utils');
const formidable = require('formidable');
const fse = require('fs-extra');
const mongo = require('../../lib/mongo');
const SettingsService = require('../settings/settings');
const ObjectID = require('mongodb').ObjectID;

class FileSystemService {
  constructor() {}

  async getImages(productObjectID) {
    return SettingsService.getSettings().then(generalSettings =>
      mongo.db.collection('products').findOne({ _id: productObjectID }, {fields: {images: 1}}).then(product => {
        if(product && product.images && product.images.length > 0) {
          let images = product.images.map(image => {
            image.url = url.resolve(generalSettings.domain, settings.productsUploadUrl + '/' + product._id + '/' + image.filename);
            return image;
          })

          images = images.sort((a,b) => (a.position - b.position ));
          return images;
        } else {
          return []
        }
      })
    )
  }

  async addImage(productId, req) {
    return new Promise((resolve, reject) => {
      let uploadedFiles = [];
      const uploadDir = path.resolve(settings.productsUploadPath + '/' + productId);
      fse.ensureDirSync(uploadDir);

      let form = new formidable.IncomingForm();
      form.uploadDir = uploadDir;

      form
        .on('fileBegin', (name, file) => {
          // Emitted whenever a field / value pair has been received.
          file.name = utils.getCorrectFileName(file.name);
          file.path = uploadDir + '/' + file.name;
        })
        .on('file', async (field, file) => {
          // every time a file has been uploaded successfully,
          if(file.name) {
            const imageData = {
              "id": new ObjectID(),
              "alt": "",
              "position": 99,
              "filename": file.name
            };

            uploadedFiles.push(imageData);
          }
        })
        .on('error', (err) => {
          reject(err);
        })
        .on('end', () => {
          resolve(uploadedFiles);
        });

      form.parse(req);
    })
  }
}

module.exports = new FileSystemService();
