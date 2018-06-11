"use strict"

const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const security = require("../lib/security")
const settings = require("../lib/settings")
const CategoriesService = require("../services/products/productCategories")
const CategoriesAnonymousService = require("../services/products/CategoriesAnonymousService")

class ProductCategoriesRoute {
  constructor(router) {
    this.router = router
    this.registerRoutes()
  }

  registerRoutes() {
    this.router.get("/v1/product_categories", this.getCategories.bind(this))
    this.router.post("/v1/product_categories", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES), this.addCategory.bind(this))
    this.router.get("/v1/product_categories/:id", security.checkUserScope.bind(this, security.scope.READ_PRODUCT_CATEGORIES), this.getSingleCategory.bind(this))
    this.router.put("/v1/product_categories/:id", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES), this.updateCategory.bind(this))
    this.router.delete("/v1/product_categories/:id", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES), this.deleteCategory.bind(this))
    this.router.post("/v1/product_categories/:id/image", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES), this.assignUploadType.bind(this), this.uploadCategoryImage.bind(this))
    this.router.delete("/v1/product_categories/:id/image", security.checkUserScope.bind(this, security.scope.WRITE_PRODUCT_CATEGORIES), this.deleteCategoryImage.bind(this))

    this.router.get("/v1/product_categories_by_slug/:slug", this.getSingleCategoryBySlug.bind(this))
  }

  getCategories(req, res, next) {
    const userIsAdmin = req.user && req.user.scopes && req.user.scopes.length > 0 && req.user.scopes.includes(security.scope.ADMIN)
    if (userIsAdmin === true) {
      return this.getCategoriesForAdmin(req, res, next)
    } else {
      return this.getCategoriesForAnonymous(req, res, next)
    }
  }

  async getCategoriesForAnonymous(req, res, next) {
    try {
      const categories = await CategoriesAnonymousService.getCategories(req.query)
      res.send(categories)
    } catch (err) {
      next(err)
    }
  }

  async getCategoriesForAdmin(req, res, next) {
    try {
      const categories = await CategoriesService.getCategories(req.query)
      res.send(categories)
    } catch (err) {
      next(err)
    }
  }

  getSingleCategory(req, res, next) {
    CategoriesService.getSingleCategory(req.params.id).then((data) => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    }).catch(next)
  }

  getSingleCategoryBySlug(req, res, next) {
    const userIsAdmin = req.user && req.user.scopes && req.user.scopes.length > 0 && req.user.scopes.includes(security.scope.ADMIN)
    if (userIsAdmin === true) {
      return this.getSingleCategoryBySlugForAdmin(req, res, next)
    } else {
      return this.getSingleCategoryBySlugForAnonymous(req, res, next)
    }
  }

  async getSingleCategoryBySlugForAnonymous(req, res, next) {
    try {
      const category = await CategoriesAnonymousService.getSingleCategoryBySlug(req.params.slug)
      if (category) {
        res.send(category)
      } else {
        res.status(404).end()
      }
    } catch (err) {
      next(err)
    }
  }

  async getSingleCategoryBySlugForAdmin(req, res, next) {
    try {
      const category = await CategoriesService.getSingleCategoryBySlug(req.params.slug)
      if (category) {
        res.send(category)
      } else {
        res.status(404).end()
      }
    } catch (err) {
      next(err)
    }
  }

  addCategory(req, res, next) {
    CategoriesService.addCategory(req.body).then((data) => {
      res.send(data)
    }).catch(next)
  }

  updateCategory(req, res, next) {
    CategoriesService.updateCategory(req.params.id, req.body).then((data) => {
      if (data) {
        res.send(data)
      } else {
        res.status(404).end()
      }
    }).catch(next)
  }

  deleteCategory(req, res, next) {
    CategoriesService.deleteCategory(req.params.id).then(data => {
      res.status(data
        ? 200
        : 404).end()
    }).catch(next)
  }

  uploadCategoryImage(req, res, next) {
    CategoriesService.uploadCategoryImage(req, res, next)
  }

  deleteCategoryImage(req, res, next) {
    CategoriesService.deleteCategoryImage(req.params.id)
    res.end()
  }

  assignUploadType(req, res, next) {
    if (settings.enableCloudinary === true) {
      upload.array("file")(req, res, next)
    } else {
      next()
    }
  }
}

module.exports = ProductCategoriesRoute
