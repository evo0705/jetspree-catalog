import download from "download"
import Queue from "./Queue"
import MessageResponse from "./MessageResponse"
import ProductsService from "../api/server/services/products/products"
import BatchUploadService, { BATCH_STATUS } from "../api/server/services/batches"
import { ParseCSVString } from "../helpers/CSV"
import { ObjectID } from "mongodb"

export const BULK_PRODUCT_DELETE = "bulk_product_delete"

export default class ProductBatchDeleteQueue {
  static async publish(batchID) {
    return Queue.shared.publishMessageToQueue(BULK_PRODUCT_DELETE, { batchID })
  }

  static async process() {
    return Queue.shared.consumeMessagesFromQueue(BULK_PRODUCT_DELETE, consume)
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
        status:       BATCH_STATUS.ABORTED,
      })
      return new MessageResponse(`Couldn't fetch batch with ID: ${batchID}`, false, false)
    }

    await BatchUploadService.update(batchItem._id, {
      date_started: new Date,
      status:       BATCH_STATUS.STARTED,
    })

    fileBuffer = await download(batchItem.file_url)
  } catch (err) {
    await BatchUploadService.update(batchObjectID, {
      date_aborted: new Date,
      status:       BATCH_STATUS.ABORTED,
    })
    return new MessageResponse(`Couldn't fetch file: ${err}`, false, true)
  }

  // 2. Parse CSV
  let productSKUArray = []
  try {
    const csvString = fileBuffer.toString("utf-8")
    const parsedData = await ParseCSVString(csvString)

    await BatchUploadService.update(batchItem._id, {
      date_parsed: new Date,
      status:      BATCH_STATUS.PARSED,
    })

    productSKUArray = parsedData.map(row => row["SKU"])
  } catch (err) {
    await BatchUploadService.update(batchItem._id, {
      date_aborted: new Date,
      status:       BATCH_STATUS.ABORTED,
    })
    return new MessageResponse(`Couldn't read file: ${err}`, false, false)
  }

  // 3. Attempt to delete products
  let totalCount = 0
  try {
    totalCount = await ProductsService.deleteProductsBySKU(productSKUArray)
  } catch (err) {
    await BatchUploadService.update(batchItem._id, {
      date_aborted: new Date,
      status:       BATCH_STATUS.ABORTED,
    })
    return new MessageResponse(`Couldn't delete products: ${err}`, false, true)
  }

  await BatchUploadService.update(batchItem._id, {
    date_completed: new Date,
    status:         BATCH_STATUS.COMPLETED,
  })

  // Return success
  return new MessageResponse(`Deleted ${totalCount} products`, true)
}
