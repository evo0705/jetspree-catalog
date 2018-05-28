class Batches {
  constructor(client) {
    this.client = client;
  }

  retrieve(batchId) {
    return this.client.get(`/batches/${batchId}`);
  }
}

module.exports = Batches
