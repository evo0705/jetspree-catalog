class BatchCreateProducts{
  constructor(client) {
    this.client = client;
  }

  list() {
    return this.client.get(`/batches/create-products`);
  }

  upload(formData) {
    return this.client.postFormData(`/batches/create-products`, formData);
  }
}

module.exports = BatchCreateProducts
