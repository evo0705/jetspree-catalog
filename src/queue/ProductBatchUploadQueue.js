const download = require("download")
const Queue = require("./Queue")
const MessageResponse = require("./MessageResponse")
const ProductsService = require("../api/server/services/products/products")
const BatchUploadService = require("../api/server/services/products/batch")
const ParseCSVString = require("../helpers/CSV").ParseCSVString
const ObjectID = require("mongodb").ObjectID

const BULK_PRODUCT_UPLOAD = "bulk_product_upload"

class ProductBatchUploadQueue {
  static async publish(batchID) {
    return Queue.shared.publishMessageToQueue(BULK_PRODUCT_UPLOAD, { batchID })
  }

  static async process() {
    return Queue.shared.consumeMessagesFromQueue(BULK_PRODUCT_UPLOAD, consume)
  }
}

async function consume(data) {
  const { batchID } = data

  let batchObjectID
  try {
    batchObjectID = new ObjectID(batchID)
  } catch (err) {
    return new MessageResponse(`Invalid identifier: ${batchID}`, false, false)
  }

  // 1. Fetch the batch record and uploaded file
  let batchItem
  let fileBuffer
  try {
    batchItem = await BatchUploadService.getBatchItemByObjectID(batchObjectID)

    await BatchUploadService.setDateStartedByObjectID(batchItem._id)

    // Verify batchItem
    if (batchItem === null) {
      await BatchUploadService.setDateStoppedByObjectID(batchItem._id)
      return new MessageResponse(`Couldn't fetch batch with ID: ${batchID}`, false, false)
    }

    fileBuffer = await download(batchItem.file_url)
  } catch (err) {
    await BatchUploadService.setDateStoppedByObjectID(batchItem._id)
    return new MessageResponse(`Couldn't fetch file: ${err}`, false, true)
  }

  // 2. Parse CSV
  let productsToInsert = []
  let validationErrors = []
  try {
    const csvString = fileBuffer.toString("utf-8")
    const parsedData = await ParseCSVString(csvString)

    // Parse data into Products
    parsedData.forEach((row, index) => {
      validationErrors.push(...validateDocumentForInsert(row, index))
    })

    if (validationErrors.length > 0) {
      // TODO: save into batch db
      return new MessageResponse(`Validation failed: ${batchID}`, false, false)
    }

    productsToInsert = parsedData.map((row, index) => {
      const product = {}
      product.sku = row["SKU"]
      product.product_id = row["Product ID"]
      product.name = row["Product Name"]
      product.description = row["Long Description"]
      product.brand = row["Brand"]
      product.images = []
      product.price = row["Price"]
      product.commission = row["Commission"]
      product.duty_free = row["Duty Free"]
      product.country_hints = row["Country Hints"]
      product.price_or_exclusive = row["Price or Exclusive"]

      product.attributes = []

      // Arrange attributes
      Object.getOwnPropertyNames(row)
        .filter(property => property.substring(0, 5) === "attr:")
        .forEach(attr => {
          if (row[attr]) {
            product.attributes.push({ name: attr.split(":")[1], value: row[attr] })
          }
        })
      return product
    })
  } catch (err) {
    await BatchUploadService.setDateStoppedByObjectID(batchItem._id)
    return new MessageResponse(`Couldn't read file: ${err}`, false, false)
  }

  // 3. Attempt to create products
  let totalCount = 0
  try {
    const insertedResponse = await ProductsService.addProducts(productsToInsert)
    totalCount = insertedResponse.insertedCount
  } catch (err) {
    await BatchUploadService.setDateStoppedByObjectID(batchItem._id)
    return new MessageResponse(`Error while creating products: ${err}`, false, true)
  }

  await BatchUploadService.setDateCompletedByObjectID(batchItem._id)

  // Return success
  return new MessageResponse(`Created ${totalCount} products`, true)
}

function validateDocumentForInsert(documentToInsert, rowIndex) {
  let errors = []

  const imageURLs = documentToInsert["Image URLs"].split("|")
  if (imageUrls.length === 0) {
    errors.push(`At least one image url is required @ row#${index}`)
  }
  // TODO: get headers from imageURLs to check availability

}

module.exports = ProductBatchUploadQueue
