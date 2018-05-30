class ProductUploadFiles{
  constructor(client) {
    this.client = client;
  }

  list(query) {
    return this.client.get(`/batches/create-products`, query);
  }

  retrieve(batchId) {
    return this.client.get(`/batches/${batchId}`);
  }

  upload(formData) {
    return this.client.postFormData(`/batches/create-products`, formData);
  }
}

module.exports = ProductUploadFiles
