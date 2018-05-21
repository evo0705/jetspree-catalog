import * as t from "./actionTypes"

const initialState = {
  fetchingBatchList:  false,
  batchList:          [],
  fetchingBatchItem:  false,
  batchItem:          {},
  uploadingBatchFile: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case t.REQUEST_BATCH_LIST:
      return Object.assign({}, state, {
        fetchingBatchList: true,
      })
    case t.RECEIVE_BATCH_LIST:
      return Object.assign({}, state, {
        fetchingBatchList: false,
        batchList:         action.batchList,
      })
    case t.RECEIVE_BATCH_LIST_ERROR:
      return Object.assign({}, state, {
        fetchingBatchList: false,
        batchList:         [],
      })
    case t.REQUEST_BATCH_ITEM:
      return Object.assign({}, state, {
        fetchingBatchItem: true,
      })
    case t.RECEIVE_BATCH_ITEM:
      return Object.assign({}, state, {
        fetchingBatchItem: false,
        batchItem:         action.batchItem,
      })
    case t.RECEIVE_BATCH_ITEM_ERROR:
      return Object.assign({}, state, {
        fetchingBatchItem: false,
        batchItem:         {},
      })
    case t.PRODUCT_BATCH_UPLOAD_START:
      return Object.assign({}, state, {
        uploadingBatchFile: true,
      })
    case t.PRODUCT_BATCH_UPLOAD_END:
      return Object.assign({}, state, {
        uploadingBatchFile: false,
      })
    default:
      return state
  }
}
