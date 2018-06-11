"use strict"

const { URL } = require("url")
const cloudinary = require("cloudinary")
const ObjectID = require("mongodb").ObjectID
const settings = require("../../lib/settings")
const mongo = require("../../lib/mongo")
const parse = require("../../lib/parse")
const CategoriesService = require("./productCategories")
const SettingsService = require("../settings/settings")
const countries = require("../../lib/countries")

class ProductsAnonymousService {
  constructor() {
  }

  async getProducts(params = {}) {
    const categories = await CategoriesService.getCategories({ fields: "parent_id" })
    const fieldsArray = this._getArrayFromCSV(params.fields)
    const limit = parse.getNumberIfPositive(params.limit) || 1000
    const offset = parse.getNumberIfPositive(params.offset) || 0
    const projectQuery = this._getProjectQuery(fieldsArray)
    const sortQuery = this._getSortQuery(params) // todo: validate every sort field
    const matchQuery = this._getMatchQuery(params, categories)
    const matchTextQuery = this._getMatchTextQuery(params)
    const itemsAggregation = []

    // $match with $text is only allowed as the first pipeline stage"
    if (matchTextQuery) {
      itemsAggregation.push({ $match: matchTextQuery })
    }
    itemsAggregation.push({ $project: projectQuery })
    itemsAggregation.push({ $match: matchQuery })
    if (sortQuery) {
      itemsAggregation.push({ $sort: sortQuery })
    }
    itemsAggregation.push({ $skip: offset })
    itemsAggregation.push({ $limit: limit })
    itemsAggregation.push({
      $lookup: {
        from:         "productCategories",
        localField:   "category_id",
        foreignField: "_id",
        as:           "categories",
      },
    })
    itemsAggregation.push({
      $project: {
        "categories.description":      0,
        "categories.meta_description": 0,
        "categories._id":              0,
        "categories.date_created":     0,
        "categories.date_updated":     0,
        "categories.image":            0,
        "categories.meta_title":       0,
        "categories.enabled":          0,
        "categories.sort":             0,
        "categories.parent_id":        0,
        "categories.position":         0,
      },
    })

    const [itemsResult, countResult, minMaxPriceResult, allAttributesResult, attributesResult, generalSettings] = await Promise.all([
      mongo.db.collection("products").aggregate(itemsAggregation).toArray(),
      this._getCountIfNeeded(params, matchQuery, matchTextQuery, projectQuery),
      this._getMinMaxPriceIfNeeded(params, categories, matchTextQuery, projectQuery),
      this._getAllAttributesIfNeeded(params, categories, matchTextQuery, projectQuery),
      this._getAttributesIfNeeded(params, categories, matchTextQuery, projectQuery),
      SettingsService.getSettings(),
    ])

    const domain = generalSettings.domain || ""
    const ids = this._getArrayFromCSV(parse.getString(params.ids))
    const sku = this._getArrayFromCSV(parse.getString(params.sku))

    let items = itemsResult.map(item => this._changeProperties(item, domain))
    items = this._sortItemsByArrayOfIdsIfNeed(items, ids, sortQuery)
    items = this._sortItemsByArrayOfSkuIfNeed(items, sku, sortQuery)
    items = items.filter(item => !!item)
    items = this._getOnlyRequiredAttributes(items)

    let total_count = 0
    let min_price = 0
    let max_price = 0

    if (countResult && countResult.length === 1) {
      total_count = countResult[0].count
    }

    if (minMaxPriceResult && minMaxPriceResult.length === 1) {
      min_price = minMaxPriceResult[0].min_price || 0
      max_price = minMaxPriceResult[0].max_price || 0
    }

    let attributes = []
    if (allAttributesResult) {
      attributes = this._getOrganizedAttributes(allAttributesResult, attributesResult, params)
    }

    return {
      price:       {
        min: min_price,
        max: max_price,
      },
      attributes:  attributes,
      total_count: total_count,
      has_more:    (offset + items.length) < total_count,
      data:        items,
    }
  }

  async getSingleProduct(id) {
    if (!ObjectID.isValid(id)) {
      return Promise.reject("Invalid identifier")
    }
    const productResponse = await this.getProducts({ ids: id, limit: 1 })
    const product = productResponse.data.length > 0 ? productResponse.data[0] : {}

    if (product.product_id !== null) {
      product.variants = await this._getProductVariants(product.product_id, product.sku)
    }
    return product
  }

  async getSingleProductBySlug(slug) {
    const productResponse = await this.getProducts({ slug, limit: 1 })
    const product = productResponse.data.length > 0 ? productResponse.data[0] : {}

    if (product.product_id !== null) {
      product.variants = await this._getProductVariants(product.product_id)
    }
    return product
  }

  async getSingleProductBySku(sku) {
    const productResponse = await this.getProducts({ sku, limit: 1 })
    const product = productResponse.data.length > 0 ? productResponse.data[0] : {}

    if (product.product_id !== null) {
      product.variants = await this._getProductVariants(product.product_id)
    }
    return product
  }

  _getOnlyRequiredAttributes(items) {
    return items.map(item => {
      return {
        id:               item.id,
        name:             item.name,
        description:      item.description,
        meta_description: item.meta_description,
        meta_title:       item.meta_title,
        slug:             item.slug,
        sku:              item.sku,
        category_id:      item.category_id,
        category_name:    item.category_name,
        category_slug:    item.category_slug,
        url:              item.url,
        path:             item.path,
        product_id:       item.product_id,
        images:           item.images,
        retail_price:     item.retail_price,
        price:            item.price,
        service_fee:      item.service_fee,
        country_hints:    item.country_hints,
        attributes:       item.attributes,
        variant_values:   item.variant_values,
      }
    });
  }

  _sortItemsByArrayOfIdsIfNeed(items, arrayOfIds, sortQuery) {
    return arrayOfIds && arrayOfIds.length > 0 && sortQuery === null && items && items.length > 0
      ? arrayOfIds.map(id => items.find(item => item.id === id))
      : items
  }

  _sortItemsByArrayOfSkuIfNeed(items, arrayOfSku, sortQuery) {
    return arrayOfSku && arrayOfSku.length > 0 && sortQuery === null && items && items.length > 0
      ? arrayOfSku.map(sku => items.find(item => item.sku === sku))
      : items
  }

  _getOrganizedAttributes(allAttributesResult, filteredAttributesResult, params) {
    const uniqueAttributesName = [...new Set(allAttributesResult.map(a => a._id.name))]

    return uniqueAttributesName
      .sort()
      .map(attributeName => ({
          name:   attributeName,
          values: allAttributesResult
                    .filter(b => b._id.name === attributeName)
                    .sort((a, b) => (a._id.value > b._id.value) ? 1 : ((b._id.value > a._id.value) ? -1 : 0))
                    .map(b => ({
                        name:    b._id.value,
                        checked: params[`attributes.${b._id.name}`] && params[`attributes.${b._id.name}`].includes(b._id.value) ? true : false,
                        // total: b.count,
                        count:   this._getAttributeCount(filteredAttributesResult, b._id.name, b._id.value),
                      }),
                    ),
        }),
      )
  }

  _getAttributeCount(attributesArray, attributeName, attributeValue) {
    const attribute = attributesArray.find(a => a._id.name === attributeName && a._id.value === attributeValue)
    return attribute ? attribute.count : 0
  }

  _getCountIfNeeded(params, matchQuery, matchTextQuery, projectQuery) {
    // get total count
    // not for product details or ids
    if (!params.ids) {
      const aggregation = []
      if (matchTextQuery) {
        aggregation.push({ $match: matchTextQuery })
      }
      aggregation.push({ $project: projectQuery })
      aggregation.push({ $match: matchQuery })
      aggregation.push({ $group: { _id: null, count: { $sum: 1 } } })
      return mongo.db.collection("products").aggregate(aggregation).toArray()
    } else {
      return null
    }
  }

  _getMinMaxPriceIfNeeded(params, categories, matchTextQuery, projectQuery) {
    // get min max price without filter by price
    // not for product details or ids
    if (!params.ids) {
      const minMaxPriceMatchQuery = this._getMatchQuery(params, categories, false, false)

      const aggregation = []
      if (matchTextQuery) {
        aggregation.push({ $match: matchTextQuery })
      }
      aggregation.push({ $project: projectQuery })
      aggregation.push({ $match: minMaxPriceMatchQuery })
      aggregation.push({ $group: { _id: null, min_price: { $min: "$price" }, max_price: { $max: "$price" } } })
      return mongo.db.collection("products").aggregate(aggregation).toArray()
    } else {
      return null
    }
  }

  _getAllAttributesIfNeeded(params, categories, matchTextQuery, projectQuery) {
    // get attributes with counts without filter by attributes
    // only for category
    const getAttributesUnconditionally = parse.getBooleanIfValid(params.get_attributes_unconditionally)
    if (params.category_id || getAttributesUnconditionally) {
      const attributesMatchQuery = this._getMatchQuery(params, categories, false, false)

      const aggregation = []
      if (matchTextQuery) {
        aggregation.push({ $match: matchTextQuery })
      }
      aggregation.push({ $project: projectQuery })
      aggregation.push({ $match: attributesMatchQuery })
      aggregation.push({ "$unwind": "$attributes" })
      aggregation.push({ "$group": { "_id": "$attributes", count: { "$sum": 1 } } })
      return mongo.db.collection("products").aggregate(aggregation).toArray()
    } else {
      return null
    }
  }

  _getAttributesIfNeeded(params, categories, matchTextQuery, projectQuery) {
    // get attributes with counts without filter by attributes
    // only for category
    const getAttributesUnconditionally = parse.getBooleanIfValid(params.get_attributes_unconditionally)
    if (params.category_id || getAttributesUnconditionally) {
      const attributesMatchQuery = this._getMatchQuery(params, categories, false, true)

      const aggregation = []
      if (matchTextQuery) {
        aggregation.push({ $match: matchTextQuery })
      }
      aggregation.push({ $project: projectQuery })
      aggregation.push({ $match: attributesMatchQuery })
      aggregation.push({ "$unwind": "$attributes" })
      aggregation.push({ "$group": { "_id": "$attributes", count: { "$sum": 1 } } })
      return mongo.db.collection("products").aggregate(aggregation).toArray()
    } else {
      return null
    }
  }

  _getSortQuery({ sort, search }) {
    const isSearchUsed = search && search.length > 0 && search !== "null" && search !== "undefined"
    if (sort === "search" && isSearchUsed) {
      return { score: { $meta: "textScore" } }
    } else if (sort && sort.length > 0) {
      const fields = sort.split(",")
      return Object.assign(...fields.map(field => (
        { [field.startsWith("-") ? field.slice(1) : field]: field.startsWith("-") ? -1 : 1 }
      )))
    } else {
      return null
    }
  }

  _getProjectQuery(fieldsArray) {
    let salePrice = "$sale_price"
    let regularPrice = "$regular_price"
    let costPrice = "$cost_price"

    let project =
      {
        category_ids:        1,
        related_product_ids: 1,
        enabled:             1,
        discontinued:        1,
        is_deleted:          1,
        date_created:        1,
        date_updated:        1,
        cost_price:          costPrice,
        regular_price:       regularPrice,
        sale_price:          salePrice,
        retail_price:        1,
        service_fee:         1,
        country_hints:       1,
        date_sale_from:      1,
        date_sale_to:        1,
        images:              1,
        prices:              1,
        quantity_inc:        1,
        quantity_min:        1,
        meta_description:    1,
        meta_title:          1,
        name:                1,
        description:         1,
        sku:                 1,
        code:                1,
        tax_class:           1,
        position:            1,
        tags:                1,
        options:             1,
        variants:            1,
        weight:              1,
        dimensions:          1,
        attributes:          1,
        variant_values:      1,
        date_stock_expected: 1,
        stock_tracking:      1,
        stock_preorder:      1,
        stock_backorder:     1,
        stock_quantity:      1,
        on_sale:             {
          $and: [
            {
              $lt: [new Date(), "$date_sale_to"],
            }, {
              $gt: [new Date(), "$date_sale_from"],
            },
          ],
        },
        variable:            {
          $gt: [
            {
              $size: { "$ifNull": ["$variants", []] },
            },
            0,
          ],
        },
        price:               {
          $cond: {
            if:   {
              $and: [
                {
                  $lt: [new Date(), "$date_sale_to"],
                }, {
                  $gt: [new Date(), "$date_sale_from"],
                }, {
                  $gt: ["$sale_price", 0],
                },
              ],
            },
            then: salePrice,
            else: regularPrice,
          },
        },
        stock_status:        {
          $cond: {
            if:   {
              $eq: ["$discontinued", true],
            },
            then: "discontinued",
            else: {
              $cond: {
                if:   {
                  $gt: ["$stock_quantity", 0],
                },
                then: "available",
                else: {
                  $cond: {
                    if:   {
                      $eq: ["$stock_backorder", true],
                    },
                    then: "backorder",
                    else: {
                      $cond: {
                        if:   {
                          $eq: ["$stock_preorder", true],
                        },
                        then: "preorder",
                        else: "out_of_stock",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        url:                 { "$literal": "" },
        path:                { "$literal": "" },
        category_name:       { "$literal": "" },
        category_slug:       { "$literal": "" },
      }

    if (fieldsArray && fieldsArray.length > 0) {
      project = this._getProjectFilteredByFields(project, fieldsArray)
    }

    // required fields
    project._id = 0
    project.id = "$_id"
    project.category_id = 1
    project.slug = 1
    project.is_deleted = 1
    project.product_id = 1
    return project
  }

  _getArrayFromCSV(fields) {
    return (fields && fields.length > 0) ? fields.split(",") : []
  }

  _getProjectFilteredByFields(project, fieldsArray) {
    return Object.assign(...fieldsArray.map(key => ({ [key]: project[key] })))
  }

  _getMatchTextQuery({ search }) {
    if (search && search.length > 0 && search !== "null" && search !== "undefined") {
      return {
        "$or": [
          { sku: new RegExp(search, "i") },
          { "$text": { "$search": search } },
        ],
      }
    } else {
      return null
    }
  }

  _getMatchAttributesQuery(params) {
    let attributesArray = Object.keys(params)
      .filter(paramName => paramName.startsWith("attributes."))
      .map(paramName => {
        const paramValue = params[paramName]
        const paramValueArray = Array.isArray(paramValue) ? paramValue : [paramValue]

        return {
          name:   paramName.replace("attributes.", ""),
          values: paramValueArray,
        }
      })

    return attributesArray
  }

  _getMatchQuery(params, categories, useAttributes = true, usePrice = true) {
    let {
      category_id,
      enabled,
      discontinued,
      on_sale,
      stock_status,
      price_from,
      price_to,
      sku,
      ids,
      tags,
      slug,
      product_id,
      country_hints,
    } = params

    // parse values
    category_id = parse.getObjectIDIfValid(category_id)
    enabled = parse.getBooleanIfValid(enabled)
    discontinued = parse.getBooleanIfValid(discontinued)
    on_sale = parse.getBooleanIfValid(on_sale)
    price_from = parse.getNumberIfPositive(price_from)
    price_to = parse.getNumberIfPositive(price_to)
    ids = parse.getString(ids)
    tags = parse.getString(tags)
    slug = parse.getString(slug)
    product_id = parse.getString(product_id)
    country_hints = parse.getString(country_hints)

    let queries = [{
      is_deleted: false,
      discontinued: false,
      enabled: true,
    }]
    const currentDate = new Date()

    if (category_id !== null) {
      let categoryChildren = []
      CategoriesService.findAllChildren(categories, category_id, categoryChildren)
      queries.push({
        "$or": [
          {
            category_id: { $in: categoryChildren },
          }, {
            category_ids: category_id,
          },
        ],
      })
    }

    if (enabled !== null) {
      queries.push({
        enabled: enabled,
      })
    }

    if (discontinued !== null) {
      queries.push({
        discontinued: discontinued,
      })
    }

    if (on_sale !== null) {
      queries.push({
        on_sale: on_sale,
      })
    }

    if (usePrice) {
      if (price_from !== null && price_from > 0) {
        queries.push({
          price: { $gte: price_from },
        })
      }

      if (price_to !== null && price_to > 0) {
        queries.push({
          price: { $lte: price_to },
        })
      }
    }

    if (stock_status && stock_status.length > 0) {
      queries.push({
        stock_status: stock_status,
      })
    }

    if (ids && ids.length > 0) {
      const idsArray = ids.split(",")
      let objectIDs = []
      for (const id of idsArray) {
        if (ObjectID.isValid(id)) {
          objectIDs.push(new ObjectID(id))
        }
      }
      queries.push({
        id: { $in: objectIDs },
      })
    }

    if (slug && slug.length > 0) {
      queries.push({
        slug: slug,
      })
    }

    if (product_id && product_id.length > 0) {
      queries.push({
        product_id: product_id,
      })
    }

    if (sku && sku.length > 0) {
      if (sku.includes(",")) {
        // multiple values
        const skus = sku.split(",")
        queries.push({
          sku: { $in: skus },
        })
      } else {
        // single value
        queries.push({
          sku: sku,
        })
      }
    }

    if (tags && tags.length > 0) {
      queries.push({
        tags: tags,
      })
    }

    if (country_hints && country_hints.length > 0) {
      const countriesArray = country_hints.split(",")
      queries.push({
        country_hints: {
          $in: countriesArray,
        },
      })
    }

    if (useAttributes) {
      const attributesArray = this._getMatchAttributesQuery(params)
      if (attributesArray && attributesArray.length > 0) {
        const matchesArray = attributesArray.map(attribute => ({
          $elemMatch: {
            "name":  attribute.name,
            "value": { "$in": attribute.values },
          },
        }))
        queries.push({
          "attributes": { "$all": matchesArray },
        })
      }
    }

    let matchQuery = {}
    if (queries.length === 1) {
      matchQuery = queries[0]
    } else if (queries.length > 1) {
      matchQuery = {
        $and: queries,
      }
    }

    return matchQuery
  }

  async _getProductVariants(productId, SKU) {
    const variantResponse = await this.getProducts({ product_id: productId })
    const variantList = variantResponse.data.length > 0 ? variantResponse.data : []
    return variantList.filter(variant => variant.sku !== SKU).map(variant => variant.sku)
  }

  _changeProperties(item, domain) {
    if (item) {

      if (item.id) {
        item.id = item.id.toString()
      }

      item.images = this._getSortedImagesWithUrls(item, domain)

      if (item.category_id) {
        item.category_id = item.category_id.toString()

        if (item.categories && item.categories.length > 0) {
          const category = item.categories[0]
          if (category) {
            if (item.category_name === "") {
              item.category_name = category.name
            }

            if (item.category_slug === "") {
              item.category_slug = category.slug
            }

            const categorySlug = category.slug || ""
            const productSlug = item.slug || ""

            if (item.url === "") {
              const itemUrl = new URL(categorySlug + "/" + productSlug, domain)
              item.url = itemUrl.toString()
            }

            if (item.path === "") {
              item.path = `/${categorySlug}/${productSlug}`
            }
          }
        }
      }
      item.categories = undefined

      if (item.country_hints) {
        const countryHints = item.country_hints.map(countryCode => countries.find(country => country.code === countryCode))
        item.country_hints = countryHints
      }
    }

    return item
  }

  _getSortedImagesWithUrls(item, domain) {
    if (item.images && item.images.length > 0) {
      return item.images.map(image => {
        if (settings.enableCloudinary === true) {
          image.url = cloudinary.url(image.external_id, { quality: "auto", fetch_format: "auto", secure: true })
        } else {
          image.url = this._getImageUrl(domain, item.id, image.filename || "")
        }
        return image
      }).sort((a, b) => (a.position - b.position))
    } else {
      return item.images
    }
  }

  _getImageUrl(domain, productId, imageFileName) {
    const imageUrl = new URL(settings.productsUploadUrl + "/" + productId + "/" + imageFileName, domain)
    return imageUrl.toString()
  }
}

module.exports = new ProductsAnonymousService()
