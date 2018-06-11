"use strict"

const url = require("url")
const settings = require("../../lib/settings")
const SettingsService = require("../settings/settings")
const mongo = require("../../lib/mongo")
const utils = require("../../lib/utils")
const parse = require("../../lib/parse")
const cloudinary = require("cloudinary")

class CategoriesAnonymousService {
  constructor() {
  }

  async getCategories(params = {}) {
    const filter = this._getFilter(params)
    const projection = utils.getProjectionFromFields(params.fields)
    const generalSettings = await SettingsService.getSettings()
    const domain = generalSettings.domain
    const items = await mongo.db.collection("productCategories").find(filter, { projection: projection }).sort({ position: 1 }).toArray()
    const result = items.map(category => this._changeProperties(category, domain))
    return result
  }

  getSingleCategoryBySlug(slug) {
    return this.getCategories({ slug }).then(categories => {
      return categories.length > 0
        ? categories[0]
        : null
    })
  }

  _getFilter(params = {}) {
    let filter = {}
    const enabled = parse.getBooleanIfValid(params.enabled)
    if (enabled !== null) {
      filter.enabled = enabled
    }
    const id = parse.getObjectIDIfValid(params.id)
    if (id) {
      filter._id = id
    }
    const slug = parse.getString(params.slug)
    if (slug) {
      filter.slug = slug
    }
    return filter
  }

  _changeProperties(item, domain) {
    if (item) {
      item.id = item._id.toString()
      item._id = undefined

      if (item.parent_id) {
        item.parent_id = item.parent_id.toString()
      }

      if (item.slug) {
        item.url = url.resolve(domain, item.slug || "")
        item.path = url.resolve("/", item.slug || "")
      }

      if (item.image) {
        if (settings.enableCloudinary === true) {
          item.image.url = cloudinary.url(item.image.external_id, {
            quality:      "auto",
            fetch_format: "auto",
            secure:       true,
          })
        } else {
          item.image = url.resolve(domain, settings.categoriesUploadUrl + "/" + item.id + "/" + item.image)
        }
      }
    }

    return item
  }
}

module.exports = new CategoriesAnonymousService()
