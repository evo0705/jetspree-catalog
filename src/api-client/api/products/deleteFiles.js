class ProductDeleteFiles{
  constructor(client) {
    this.client = client;
  }

  list(query) {
    return this.client.get(`/batches/delete-products`, query);
  }

  retrieve(batchId) {
    return this.client.get(`/batches/${batchId}`);
  }

  upload(formData) {
    return this.client.postFormData(`/batches/delete-products`, formData);
  }
}

module.exports = ProductDeleteFiles
