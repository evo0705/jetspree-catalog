const download = require("download")
const { Queue, QUEUE_NAMES } = require("./Queue")
const MessageResponse = require("./MessageResponse")
const ProductsService = require("../api/server/services/products/products")
const BatchUploadService = require("../api/server/services/products/batch")
const ParseCSVString = require("../helpers/CSV").ParseCSVString
const ObjectID = require("mongodb").ObjectID

class ProductBatchDeleteQueue {
  static async process() {
    return Queue.shared.consumeMessagesFromQueue(QUEUE_NAMES.BULK_PRODUCT_DELETE, consume)
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

    // Verify batchItem
    if (batchItem === null) {
      await BatchUploadService.update(batchItem._id, {
        date_aborted: new Date,
        status:       BatchUploadService.BATCH_STATUS.ABORTED,
      })
      return new MessageResponse(`Couldn't fetch batch with ID: ${batchID}`, false, false)
    }

    await BatchUploadService.update(batchItem._id, {
      date_started: new Date,
      status:       BatchUploadService.BATCH_STATUS.STARTED,
    })

    fileBuffer = await download(batchItem.file_url)
  } catch (err) {
    await BatchUploadService.update(batchItem._id, {
      date_aborted: new Date,
      status:       BatchUploadService.BATCH_STATUS.ABORTED,
    })
    return new MessageResponse(`Couldn't fetch file: ${err}`, false, true)
  }

  // 2. Parse CSV
  let productObjectIDArray = []
  try {
    const csvString = fileBuffer.toString("utf-8")
    const parsedData = await ParseCSVString(csvString)

    await BatchUploadService.update(batchItem._id, {
      date_parsed: new Date,
      status:      BatchUploadService.BATCH_STATUS.PARSED,
    })

    // Validate ObjectID and map it into array
    productObjectIDArray.push(...parsedData.map(row => {
      if (!ObjectID.isValid(row.id)) {
        throw new MessageResponse(`Invalid identifier: ${row.id}`, false, false)
      }
      return new ObjectID(row.id)
    }))
  } catch (err) {
    await BatchUploadService.update(batchItem._id, {
      date_aborted: new Date,
      status:       BatchUploadService.BATCH_STATUS.ABORTED,
    })
    return new MessageResponse(`Couldn't read file: ${err}`, false, false)
  }

  // 3. Attempt to delete products
  let totalCount = 0
  try {
    totalCount = await ProductsService.deleteProductsByObjectIDArray(productObjectIDArray)
  } catch (err) {
    await BatchUploadService.update(batchItem._id, {
      date_aborted: new Date,
      status:       BatchUploadService.BATCH_STATUS.ABORTED,
    })
    return new MessageResponse(`Couldn't delete products: ${err}`, false, true)
  }

  await BatchUploadService.update(batchItem._id, {
    date_completed: new Date,
    status:         BatchUploadService.BATCH_STATUS.COMPLETED,
  })

  // Return success
  return new MessageResponse(`Deleted ${totalCount} products`, true)
}

module.exports = ProductBatchDeleteQueue
