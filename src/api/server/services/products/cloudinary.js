'use strict';

const cloudinary = require('cloudinary');
const mongo = require('../../lib/mongo');
const ObjectID = require('mongodb').ObjectID;
const MAX_SIZE = 2048

class CloudinaryService {
  constructor() {}

  async getImages(productObjectID) {
    return mongo.db.collection('products').findOne({ _id: productObjectID }, {fields: {images: 1}}).then(product => {
      if(product && product.images && product.images.length > 0) {
        let images = product.images.map(image => {
          image.url = cloudinary.url(image.external_id, { quality: "auto", fetch_format: "auto", secure: true })
          return image;
        })

        images = images.sort((a,b) => (a.position - b.position ));
        return images;
      } else {
        return []
      }
    })
  }

  async addImage(productId, req) {
    const imageFiles = req.files;
    const dataURIs = imageFiles.map(image => {
      return "data:" + image.mimetype + ";base64," + image.buffer.toString("base64");
    })
    return await this.uploadImageURIs(dataURIs);
  }

  async uploadImageURIs(URIs) {
    try {
      const uploadedImages = await Promise.all(URIs.map(async URI => {
        try {
          return await cloudinary.v2.uploader.upload(URI, {
            width:  MAX_SIZE,
            height: MAX_SIZE,
            crop:   "limit",
            format: "png",
          });
        } catch (err) {
          return err
        }
      }))

      return uploadedImages.map(image => {
        return {
          "id": new ObjectID(),
          "alt": "",
          "position": 99,
          "external_id": image.public_id
        }
      });
    } catch (err) {
      console.error("Cloudinary upload failed:", err)
      return err;
    }
  }
}

module.exports = new CloudinaryService();
