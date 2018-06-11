import mongo from "./api/server/lib/mongo"

function waitForMongoConnection() {
  if (!mongo.db) {
    setTimeout(waitForMongoConnection, 1000)
  } else {
    createIndexes()
  }
}

waitForMongoConnection()

async function createIndexes() {
  console.log("Creating Indexes...")
  try {
    await Promise.all([
      mongo.db.collection("productCategories").createIndex({ enabled: 1 }),
      mongo.db.collection("productCategories").createIndex({ slug: 1 }),
      mongo.db.collection("products").createIndex({ slug: 1 }),
      mongo.db.collection("products").createIndex({ enabled: 1 }),
      mongo.db.collection("products").createIndex({ category_id: 1 }),
      mongo.db.collection("products").createIndex({ sku: 1 }, { unique: true }),
      mongo.db.collection("products").createIndex({ "attributes.name": 1, "attributes.value": 1 }),
      mongo.db.collection("products").createIndex({
        "name":        "text",
        "description": "text",
      }, { default_language: "english", name: "textIndex" }),
    ])
    console.log("Done!")
  } catch (err) {
    console.log(err)
  }
  process.exit()
}
