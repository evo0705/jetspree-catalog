"use strict"

const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const security = require("../lib/security")
const BatchUploadService = require("../services/batches")
const { QUEUE_NAMES } = require("../../../queue/Queue")
const ObjectID = require("mongodb").ObjectID

class BatchesRoute {
  constructor(router) {
    this.router = router
    this.registerRoutes()
  }

  registerRoutes() {
    this.router.get("/v1/batches/create-products", security.checkUserScope.bind(this, security.scope.READ_PRODUCTS), this.getBatchesForCreateProducts.bind(this))
    this.router.post("/v1/batches/create-products", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS), upload.single("file"), this.uploadBatchFile.bind(this))

    this.router.get("/v1/batches/delete-products", security.checkUserScope.bind(this, security.scope.READ_PRODUCTS), this.getBatchesForDeleteProducts.bind(this))
    this.router.post("/v1/batches/delete-products", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS), upload.single("file"), this.uploadBatchDeleteFile.bind(this))

    this.router.get("/v1/batches/:batchId", security.checkUserScope.bind(this, security.scope.READ_PRODUCTS), this.getBatchItem.bind(this))
  }

  getErrorMessage(err) {
    return { "error": true, "message": err.toString() }
  }

  async getBatchesForCreateProducts(req, res) {
    try {
      const batchList = await BatchUploadService.getBatchItemList(QUEUE_NAMES.BULK_PRODUCT_UPLOAD)
      res.status(200).send(batchList)
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error))
    }
  }

  async getBatchesForDeleteProducts(req, res) {
    try {
      const batchList = await BatchUploadService.getBatchItemList(QUEUE_NAMES.BULK_PRODUCT_DELETE)
      res.status(200).send(batchList)
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error))
    }
  }

  async getBatchItem(req, res, next) {
    const { batchId } = req.params

    let batchObjectID
    try {
      batchObjectID = new ObjectID(batchId)
    } catch (err) {
      return res.status(422).json("Invalid identifier")
    }

    try {
      const batchItem = await BatchUploadService.getBatchItemByObjectID(batchObjectID)

      if (batchItem === null) {
        return res.status(404)
      }

      res.json(batchItem)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  async uploadBatchFile(req, res, next) {
    await BatchUploadService.uploadFile(req, res, QUEUE_NAMES.BULK_PRODUCT_UPLOAD)
  }

  async uploadBatchDeleteFile(req, res, next) {
    await BatchUploadService.uploadFile(req, res, QUEUE_NAMES.BULK_PRODUCT_DELETE)
  }
}

module.exports = BatchesRoute
