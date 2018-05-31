"use strict"

import Queue from "../queue/Queue"
import ProductBatchUploadQueue from "../queue/ProductBatchUploadQueue"
import ProductBatchDeleteQueue from "../queue/ProductBatchDeleteQueue"
import ProductBatchUpdateQueue from "../queue/ProductBatchUpdateQueue"

serve().catch()

// Serve
async function serve() {
  // Init DB and Queue
  console.log("Initializing database and message queue...")
  await Queue.init().catch(handleWorkerCrash)

  // Start workers
  console.log("Starting workers...")
  try {
    await Promise.all([
      ProductBatchDeleteQueue.process(),
      ProductBatchUploadQueue.process(),
      ProductBatchUpdateQueue.process(),
    ])
    console.log("All workers started successfully.")
  } catch (err) {
    handleWorkerCrash(err)
  }
}

// Handle errors by logging and exiting so all workers can restart
function handleWorkerCrash(err) {
  console.error(err)
  process.exit()
}
