class ProductUpdateFiles{
  constructor(client) {
    this.client = client;
  }

  list(query) {
    return this.client.get(`/batches/update-products`, query);
  }

  retrieve(batchId) {
    return this.client.get(`/batches/${batchId}`);
  }

  upload(formData) {
    return this.client.postFormData(`/batches/update-products`, formData);
  }
}

module.exports = ProductUpdateFiles
