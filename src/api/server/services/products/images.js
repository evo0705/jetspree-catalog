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

class ProductImagesService {
  constructor() {}

  getErrorMessage(err) {
    return { 'error': true, 'message': err.toString() };
  }

  async getImages(productId) {
    if(!ObjectID.isValid(productId)) {
      return Promise.reject('Invalid identifier');
    }
    let productImages = [];
    let productObjectID = new ObjectID(productId);

    if(settings.enableCloudinary === true) { // use cloudinary to store images
      productImages = await CloudinaryService.getImages(productObjectID);
    } else { // use filesystem to store images
      productImages = await FileSystemService.getImages(productObjectID);
    }
    return productImages;
  }

  deleteImage(productId, imageId) {
    if(!ObjectID.isValid(productId) || !ObjectID.isValid(imageId)) {
      return Promise.reject('Invalid identifier');
    }
    let productObjectID = new ObjectID(productId);
    let imageObjectID = new ObjectID(imageId);

    return this.getImages(productId)
    .then(images => {
      if(images && images.length > 0) {
        let imageData = images.find(i => i.id.toString() === imageId.toString());
        if(imageData) {
          let filename = imageData.filename;
          let filepath = path.resolve(settings.productsUploadPath + '/' + productId + '/' + filename);
          fse.removeSync(filepath);
          return mongo.db.collection('products').updateOne({ _id: productObjectID }, { $pull: { images: { id: imageObjectID } } })
        } else {
          return true;
        }
      } else {
        return true;
      }
    })
    .then(() => true);
  }

  async addImage(req, res) {
    let uploadedImages = null
    const productId = req.params.productId;
    const productObjectID = new ObjectID(productId);

    if(!ObjectID.isValid(productId)) {
      res.status(500).send(this.getErrorMessage('Invalid identifier'));
      return;
    }

    if(settings.enableCloudinary === true) { // use cloudinary to store images
      try {
        uploadedImages = await CloudinaryService.addImage(req);
      } catch (error) {
        console.error("Cloudinary image upload failed:", error)
        res.status(500).send(this.getErrorMessage(error));
      }
    } else { // use filesystem to store images
      try {
        uploadedImages = await FileSystemService.addImage(productId, req);
      } catch (error) {
        console.error("Image upload failed:", error)
        res.status(500).send(this.getErrorMessage(error));
      }
    }

    const uploadedData = await Promise.all(uploadedImages.map(async image => {
      try {
        return await mongo.db.collection('products').updateOne({
          _id: productObjectID
        }, {
          $push: { images: image }
        });
      } catch (error) {
        console.error("Image update failed:", error)
        res.status(500).send(this.getErrorMessage(error));
      }
    }));

    res.send(uploadedImages)
  }

  updateImage(productId, imageId, data) {
    if(!ObjectID.isValid(productId) || !ObjectID.isValid(imageId)) {
      return Promise.reject('Invalid identifier');
    }
    let productObjectID = new ObjectID(productId);
    let imageObjectID = new ObjectID(imageId);

    const imageData = this.getValidDocumentForUpdate(data);

    return mongo.db.collection('products').updateOne({
      _id: productObjectID,
      'images.id': imageObjectID
    }, {$set: imageData});
  }

  getValidDocumentForUpdate(data) {
    if (Object.keys(data).length === 0) {
      return new Error('Required fields are missing');
    }

    let image = {};

    if (data.alt !== undefined) {
      image['images.$.alt'] = parse.getString(data.alt);
    }

    if (data.position !== undefined) {
      image['images.$.position'] = parse.getNumberIfPositive(data.position) || 0;
    }

    return image;
  }
}

module.exports = new ProductImagesService();
