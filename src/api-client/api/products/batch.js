class ProductBatchUpload {
  constructor(client) {
    this.client = client;
  }

  list() {
    return this.client.get(`/products/batch/list`);
  }

  retrieve(batchId) {
    return this.client.get(`/products/batch/${batchId}`);
  }

  upload(formData) {
    return this.client.postFormData(`/products/batch`, formData);
  }
}

module.exports = ProductBatchUpload
