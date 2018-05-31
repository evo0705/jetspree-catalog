"use strict"

import multer from "multer"

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

import security from "../lib/security"
import BatchUploadService, {BATCH_ACTION} from "../services/batches"
import { ObjectID } from "mongodb"

export default class BatchesRoute {
  constructor(router) {
    this.router = router
    this.registerRoutes()
  }

  registerRoutes() {
    this.router.get("/v1/batches/create-products", security.checkUserScope.bind(this, security.scope.READ_BATCHES), this.getBatchesForCreateProducts.bind(this))
    this.router.post("/v1/batches/create-products", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS), upload.single("file"), this.uploadBatchFile.bind(this))

    this.router.get("/v1/batches/delete-products", security.checkUserScope.bind(this, security.scope.READ_BATCHES), this.getBatchesForDeleteProducts.bind(this))
    this.router.post("/v1/batches/delete-products", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS), upload.single("file"), this.uploadBatchDeleteFile.bind(this))

    this.router.get("/v1/batches/update-products", security.checkUserScope.bind(this, security.scope.READ_BATCHES), this.getBatchesForUpdateProducts.bind(this))
    this.router.post("/v1/batches/update-products", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCTS), upload.single("file"), this.uploadBatchUpdateFile.bind(this))

    this.router.get("/v1/batches/:batchId", security.checkUserScope.bind(this, security.scope.READ_BATCHES), this.getBatchItem.bind(this))
  }

  getErrorMessage(err) {
    return { "error": true, "message": err.toString() }
  }

  async getBatchesForCreateProducts(req, res) {
    const query = req.query
    try {
      const batchList = await BatchUploadService.getBatchItemList(BATCH_ACTION.CREATE_PRODUCTS, query)
      res.status(200).send(batchList)
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error))
    }
  }

  async getBatchesForDeleteProducts(req, res) {
    const query = req.query
    try {
      const batchList = await BatchUploadService.getBatchItemList(BATCH_ACTION.DELETE_PRODUCTS, query)
      res.status(200).send(batchList)
    } catch (error) {
      res.status(500).send(this.getErrorMessage(error))
    }
  }

  async getBatchesForUpdateProducts(req, res) {
    const query = req.query
    try {
      const batchList = await BatchUploadService.getBatchItemList(BATCH_ACTION.UPDATE_PRODUCTS, query)
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
    await BatchUploadService.uploadFile(req, res, BATCH_ACTION.CREATE_PRODUCTS)
  }

  async uploadBatchDeleteFile(req, res, next) {
    await BatchUploadService.uploadFile(req, res, BATCH_ACTION.DELETE_PRODUCTS)
  }

  async uploadBatchUpdateFile(req, res, next) {
    await BatchUploadService.uploadFile(req, res, BATCH_ACTION.UPDATE_PRODUCTS)
  }
}
