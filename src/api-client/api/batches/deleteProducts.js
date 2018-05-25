class BatchDeleteProducts{
  constructor(client) {
    this.client = client;
  }

  list() {
    return this.client.get(`/batches/delete-products`);
  }

  upload(formData) {
    return this.client.postFormData(`/batches/delete-products`, formData);
  }
}

module.exports = BatchDeleteProducts
