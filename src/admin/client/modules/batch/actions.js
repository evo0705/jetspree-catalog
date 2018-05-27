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
    type: t.REQUEST_BATCH_LIST_ERROR,
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
    type: t.REQUEST_BATCH_ITEM_ERROR,
  }
}

function batchUploadStart() {
  return {
    type: t.PRODUCT_BATCH_UPLOAD_START,
  }
}

function batchUploadEnd() {
  return {
    type: t.PRODUCT_BATCH_UPLOAD_END,
  }
}

export function fetchBatchList() {
  return (dispatch, getState) => {
    dispatch(requestBatchList())
    return api.products.batch.list().then(({ status, json }) => {
      dispatch(receiveBatchList(json))
    })
      .catch(error => {
        dispatch(receiveBatchListError(error))
      })
  }
}

export function fetchBatchItem(batchId) {
  return (dispatch, getState) => {
    dispatch(requestBatchItem())
    return api.products.batch.retrieve(batchId).then(({ status, json }) => {
      dispatch(receiveBatchItem(json))
    })
      .catch(error => {
        dispatch(receiveBatchItemError(error))
      })
  }
}

export function uploadBatchFile(formData) {
  return (dispatch, getState) => {
    dispatch(batchUploadStart())

    return api.products.batch.upload(formData)
      .then(({ status, json }) => {
        dispatch(batchUploadEnd())
      })
      .catch(error => {
        dispatch(batchUploadEnd())
      })
  }
}
