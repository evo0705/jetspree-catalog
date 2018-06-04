import download from "download"
import Queue from "./Queue"
import MessageResponse from "./MessageResponse"
import ProductsService from "../api/server/services/products/products"
import ProductCategoriesService from "../api/server/services/products/productCategories"
import BatchUploadService, { BATCH_STATUS } from "../api/server/services/batches"
import { ParseCSVString } from "../helpers/CSV"
import { ObjectID } from "mongodb"
import rp from "request-promise"
import countries from "../api/server/lib/countries"
import cloudinary from "../api/server/services/products/cloudinary"
import _ from "lodash"
import parse from "../api/server/lib/parse"

export const BULK_PRODUCT_UPLOAD = "bulk_product_upload"

export default class ProductBatchUploadQueue {
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
    await BatchUploadService.update(batchItem._id, {
      date_aborted: new Date,
      status:       BATCH_STATUS.ABORTED,
    })
    return new MessageResponse(`Couldn't fetch file: ${err}`, false, true)
  }

  // 2. Parse CSV
  let productsToInsert = []
  let validationErrors = []
  try {
    const csvString = fileBuffer.toString("utf-8")
    const parsedData = await ParseCSVString(csvString)

    const categoryNames = _.uniqBy(parsedData, "Category Name").map(row => row["Category Name"])
    const categoryList = await ProductCategoriesService.getCategoryByNames(categoryNames)

    // Validate the parsed data
    const allErrors = await Promise.all(parsedData.map((row) => validateDataForInsert(row, parsedData, categoryList)))
    validationErrors = allErrors
      .map((rowErrors, index) => {
        if (rowErrors.length > 0) {
          return {
            row_no: index + 1,
            errors: rowErrors,
          }
        }
        return null
      })
      .filter(rowErrors => rowErrors !== null)

    // If validation has errors, save details into batch db and skip the insert
    if (validationErrors.length > 0) {
      await BatchUploadService.update(batchItem._id, {
        date_aborted: new Date,
        status:       BATCH_STATUS.ABORTED,
        errors:       validationErrors,
      })
      return new MessageResponse(`Validation failed: ${batchID}`, false, false)
    }

    // Upload images to cloudinary asynchronously
    const imageUploads = await Promise.all(parsedData.map(row => {
      const imageUrls = row["Image URLs"].split("|")
      return cloudinary.uploadImageURIs(imageUrls)
    }))
    parsedData.forEach((row, index) => {
      row["Image URLs"] = imageUploads[index]
    })

    // Parse data into a valid Products Document
    productsToInsert = getValidDocumentsForInsert(parsedData, categoryList)

    await BatchUploadService.update(batchItem._id, {
      date_parsed: new Date(),
      status:      BATCH_STATUS.PARSED,
      data:        { products: productsToInsert },
    })
  } catch (err) {
    await BatchUploadService.update(batchItem._id, { date_stopped: new Date(), status: "stopped" })
    return new MessageResponse(`Couldn't read file: ${err}`, false, false)
  }

  // 3. Attempt to create products
  let totalCount = 0
  try {
    const insertedResponse = await ProductsService.addProducts(productsToInsert)
    totalCount = insertedResponse.insertedCount
  } catch (err) {
    await BatchUploadService.update(batchItem._id, {
      date_aborted: new Date,
      status:       BATCH_STATUS.ABORTED,
    })
    return new MessageResponse(`Error while creating products: ${err}`, false, true)
  }

  await BatchUploadService.update(batchItem._id, {
    date_completed: new Date,
    status:         BATCH_STATUS.COMPLETED,
  })

  // Return success
  return new MessageResponse(`Created ${totalCount} products`, true)
}

function getValidDocumentsForInsert(parsedData, categoryList) {
  return parsedData.map(row => {
    // Fetch category id
    const categoryID = categoryList.find(category => category.name === row["Category Name"])._id

    // Build attributes
    const attributes = Object.getOwnPropertyNames(row)
      .filter(property => property.substring(0, 5) === "attr:")
      .map(attr => {
        if (row[attr]) {
          return { name: attr.split(":")[1], value: row[attr] }
        }
      })

    // Build variants
    const variants = Object.getOwnPropertyNames(row)
      .filter(property => property.substring(0, 4) === "var:")
      .map(attr => {
        if (row[attr]) {
          return { name: attr.split(":")[1], value: row[attr] }
        }
      })

    return {
      sku:                 row["SKU"],
      slug:                row["Slug"],
      product_id:          row["Product ID"],
      meta_title:          row["Meta Title"],
      meta_description:    row["Meta Description"],
      name:                row["Product Name"],
      description:         row["Long Description"],
      brand:               row["Brand"],
      category_id:         categoryID,
      category_ids:        [categoryID],
      regular_price:       parse.getNumberIfPositive(row["Price"]) || 0,
      commission:          parse.getNumberIfPositive(row["Commission %"]) || 5,
      duty_free:           parse.getBooleanIfValid(row["Duty Free"], false),
      country_hints:       row["Country Hints"].split("|"),
      price_or_exclusive:  row["Price or Exclusive"],
      images:              row["Image URLs"],
      attributes:          attributes,
      variants:            variants,
      date_created:        new Date(),
      date_updated:        null,
      enabled:             true,
      discontinued:        false,
      tags:                [],
      code:                "",
      tax_class:           "",
      related_product_ids: [],
      prices:              [],
      cost_price:          0,
      sale_price:          0,
      service_fee:         5,
      quantity_inc:        1,
      quantity_min:        1,
      weight:              0,
      stock_quantity:      parse.getNumberIfPositive(row["Stock Quantity"]),
      position:            null,
      date_stock_expected: null,
      date_sale_from:      null,
      date_sale_to:        null,
      stock_tracking:      false,
      stock_preorder:      false,
      stock_backorder:     false,
      dimensions:          {
        length: 0,
        width:  0,
        height: 0,
      },
      options:             [],
      is_deleted:          false,
    }
  })
}

async function validateDataForInsert(documentToInsert, parsedData, categoryList) {
  const validationErrors = []
  const requiredFields = [
    "SKU", "Slug", "Product ID", "Meta Title", "Meta Description", "Product Name", "Long Description", "Brand", "Category Name", "Image URLs", "Price",
    "Commission %", "Duty Free", "Country Hints", "Price or Exclusive", "Stock Quantity"
  ]

  for (let index = 0; index < requiredFields.length; index++) {
    const field = requiredFields[index]
    const error = {
      column_no:      index + 1,
      column_name:    field,
      error_messages: [],
    }
    const fieldValue = documentToInsert[field]

    if (fieldValue === undefined || fieldValue === "") {
      error.error_messages.push("Required.")
    } else {
      if (field === "SKU") {
        const hasDuplicatedSKU = parsedData.filter(data => data["SKU"] === fieldValue).length > 1
        if (hasDuplicatedSKU) {
          error.error_messages.push(`Duplicated SKU.`)
        }

        const isSkuExists = await ProductsService.isSkuExists(fieldValue)
        if (isSkuExists) {
          error.error_messages.push("Already exists.")
        }
      }

      if (field === "Slug") {
        const isSlugExits = await ProductsService.isSlugExists(fieldValue)
        if (isSlugExits) {
          error.error_messages.push("Already exists.")
        }
      }

      if (field === "Category Name") {
        const category = categoryList.find(category => category.name === fieldValue)
        if (category === undefined) {
          error.error_messages.push("Invalid Category Name.")
        }
      }

      if (field === "Product ID" && isNaN(fieldValue) === true) {
        error.error_messages.push("Must be a number.")
      }

      if (field === "Price" && isNaN(fieldValue) === true) {
        error.error_messages.push("Must be a number.")
      }

      if (field === "Duty Free" && fieldValue !== "true" && fieldValue !== "false") {
        error.error_messages.push("Must be a boolean.")
      }

      if (field === "Price or Exclusive" && fieldValue !== "price" && fieldValue !== "exclusive") {
        error.error_messages.push("Not a valid value.")
      }

      if (field === "Country Hints") {
        const countryHints = fieldValue.split("|")
        error.error_messages.push(... validateCountryHints(countryHints))
      }

      if (field === "Image URLs") {
        const imageURLs = fieldValue.split("|")
        error.error_messages.push(...await validateImageURLs(imageURLs))
      }

      if (field === "Stock Quantity" && isNaN(fieldValue) === true) {
        error.error_messages.push("Must be a number.")
      }

    }

    if (error.error_messages.length > 0) {
      validationErrors.push(error)
    }
  }
  return validationErrors
}

function validateCountryHints(countryHints) {
  const errors = []
  countryHints.forEach(countryHint => {
    if (countries.find(country => country.code === countryHint) === undefined) {
      errors.push(`${countryHint} is not a valid country code.`)
    }
  })
  return errors
}

async function validateImageURLs(imageURLs) {
  const errors = await Promise.all(imageURLs.map((imageURL, index) => {

      if (imageURL.substring(0, 4) !== "http") {
        return `Image URL #${index + 1} is not a valid url.`
      }

      return rp({ method: "HEAD", uri: imageURL })
        .then(response => {
          if (response["content-type"].substring(0, 5) !== "image") {
            return `Image URL #${index + 1} is not an image.`
          }
          return null
        })
        .catch((err) => {
          return `Unable to access Image Url #${index + 1}.`
        })

    }),
  )
  return errors.filter(error => error !== null)
}
