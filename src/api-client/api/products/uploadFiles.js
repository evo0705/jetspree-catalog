class ProductUploadFiles{
  constructor(client) {
    this.client = client;
  }

  list(query) {
    return this.client.get(`/batch-files`, query);
  }

  retrieve(batchId) {
    return this.client.get(`/batch-files/${batchId}`);
  }

  uploadCreateProductsFile(formData) {
    return this.client.postFormData(`/batch-files/create-products`, formData);
  }

  uploadDeleteProductsFile(formData) {
    return this.client.postFormData(`/batch-files/delete-products`, formData);
  }
}

module.exports = ProductUploadFiles
