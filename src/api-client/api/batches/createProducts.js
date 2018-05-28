class BatchCreateProducts{
  constructor(client) {
    this.client = client;
  }

  list(query) {
    return this.client.get(`/batches/create-products`, query);
  }

  upload(formData) {
    return this.client.postFormData(`/batches/create-products`, formData);
  }
}

module.exports = BatchCreateProducts
