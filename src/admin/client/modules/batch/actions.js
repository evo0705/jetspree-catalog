import * as t from "./actionTypes"
import api from "lib/api"

function requestBatchList() {
  return {
    type: t.REQUEST_BATCH_LIST,
  }
}

function receiveBatchList(batchList) {
  return {
    type: t.RECEIVE_BATCH_LIST,
    batchList,
  }
}

function receiveBatchListError() {
  return {
    type: t.RECEIVE_BATCH_LIST_ERROR,
  }
}

function requestBatchItem() {
  return {
    type: t.REQUEST_BATCH_ITEM,
  }
}

function receiveBatchItem(batchItem) {
  return {
    type: t.RECEIVE_BATCH_ITEM,
    batchItem,
  }
}

function receiveBatchItemError() {
  return {
    type: t.RECEIVE_BATCH_ITEM_ERROR,
  }
}

function batchUploadStart() {
  return {
    type: t.PRODUCT_BATCH_UPLOAD_START,
  }
}

function batchUploadEnd(batchUploadItem) {
  return {
    type: t.PRODUCT_BATCH_UPLOAD_END,
    batchUploadItem,
  }
}

function batchUploadError() {
  return {
    type: t.PRODUCT_BATCH_UPLOAD_ERROR,
  }
}

export function fetchBatchCreateProducts(query) {
  return (dispatch, getState) => {
    dispatch(requestBatchList())
    return api.batches.createProducts.list(query).then(({ status, json }) => {
      dispatch(receiveBatchList(json))
    })
      .catch(error => {
        dispatch(receiveBatchListError(error))
      })
  }
}


export function fetchBatchDeleteProducts() {
  return (dispatch, getState) => {
    dispatch(requestBatchList())
    return api.batches.deleteProducts.list().then(({ status, json }) => {
      dispatch(receiveBatchList(json))
    })
      .catch(error => {
        dispatch(receiveBatchListError(error))
      })
  }
}

export function fetchBatchByID(batchId) {
  return (dispatch, getState) => {
    dispatch(requestBatchItem())
    return api.batches.retrieve(batchId).then(({ status, json }) => {
      dispatch(receiveBatchItem(json))
    })
      .catch(error => {
        dispatch(receiveBatchItemError(error))
      })
  }
}

export function uploadBatchCreateProductsFile(formData) {
  return (dispatch, getState) => {
    dispatch(batchUploadStart())

    return api.batches.createProducts.upload(formData)
      .then(({ status, json }) => {
        dispatch(batchUploadEnd(json))
      })
      .catch(error => {
        dispatch(batchUploadError())
      })
  }
}

export function uploadBatchDeleteProductsFile(formData) {
  return (dispatch, getState) => {
    dispatch(batchUploadStart())

    return api.batches.deleteProducts.upload(formData)
      .then(({ status, json }) => {
        dispatch(batchUploadEnd())
      })
      .catch(error => {
        dispatch(batchUploadEnd())
      })
  }
}
