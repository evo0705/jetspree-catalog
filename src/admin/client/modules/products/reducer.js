import * as t from './actionTypes'

const initialState = {
  editProductImages: null,
  editProductOptions: null,
  editProductVariants: null,
  editProduct: null,
  items: [],
  selected: [],
  hasMore: false,
  totalCount: 0,

  isUpdating: false,
  loadingItems: false,
  uploadingImages: false,
  fetchingBatchList: false,
  batchList: [],
  fetchingBatchItem: false,
  batchItem: {},
  uploadingBatchFile: false,

  errorFetchEdit: null,
  errorLoadingItems: null,
  errorUpdate: null,

  filter: {
    search: '',
    enabled: null,
    discontinued: false,
    onSale: null,
    stockStatus: null
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case t.PRODUCT_DETAIL_REQUEST:
      return Object.assign({}, state, {
      })
    case t.PRODUCT_DETAIL_RECEIVE:
      return Object.assign({}, state, {
        editProduct: action.item
      })
    case t.PRODUCT_DETAIL_ERASE:
      return Object.assign({}, state, {
        isUpdating: false,
        editProduct: null,
        editProductImages: null,
        editProductOptions: null,
        editProductVariants: null
      })
    case t.PRODUCT_DETAIL_FAILURE:
      return Object.assign({}, state, {
        errorFetchEdit: action.error
      })
    case t.PRODUCTS_REQUEST:
      return Object.assign({}, state, {
        loadingItems: true
      })
    case t.PRODUCTS_RECEIVE:
      return Object.assign({}, state, {
        loadingItems: false,
        hasMore: action.has_more,
        totalCount: action.total_count,
        items: action.data
      })
    case t.PRODUCTS_FAILURE:
      return Object.assign({}, state, {
        errorLoadingItems: action.error
      })
    case t.PRODUCTS_SELECT:
      return Object.assign({}, state, {
        selected: [...state.selected, action.productId]
      })
    case t.PRODUCTS_DESELECT:
      return Object.assign({}, state, {
        selected: state.selected.filter(id => id !== action.productId)
      })
    case t.PRODUCTS_DESELECT_ALL:
      return Object.assign({}, state, {
        selected: []
      })
    case t.PRODUCTS_SELECT_ALL:
      let selected = state.items.map(item => item.id);
      return Object.assign({}, state, {
        selected: selected
      })
    case t.PRODUCTS_SET_FILTER:
      const newFilter = Object.assign({}, state.filter, action.filter)
      return Object.assign({}, state, {
        filter: newFilter
      })
    case t.PRODUCTS_MORE_REQUEST:
      return Object.assign({}, state, {
        loadingItems: true
      })
    case t.PRODUCTS_MORE_RECEIVE:
      return Object.assign({}, state, {
        loadingItems: false,
        hasMore: action.has_more,
        totalCount: action.total_count,
        items: [...state.items, ...action.data]
      })
    case t.PRODUCT_UPDATE_REQUEST:
      return Object.assign({}, state, {
        isUpdating: true
      })
    case t.PRODUCT_VARIANTS_RECEIVE:
      return Object.assign({}, state, {
        editProductVariants: action.variants
      })
    case t.PRODUCT_OPTIONS_RECEIVE:
      return Object.assign({}, state, {
        editProductOptions: action.options
      })
    case t.PRODUCT_IMAGES_RECEIVE:
      return Object.assign({}, state, {
        editProductImages: action.images
      })
    case t.PRODUCT_UPDATE_FAILURE:
    case t.PRODUCT_UPDATE_SUCCESS:
      return Object.assign({}, state, {
        isUpdating: false,
        editProduct: action.item
      })
    case t.PRODUCT_IMAGES_UPLOAD_START:
      return Object.assign({}, state, {
        uploadingImages: true
      })
    case t.PRODUCT_IMAGES_UPLOAD_END:
      return Object.assign({}, state, {
        uploadingImages: false
      })
    case t.REQUEST_BATCH_LIST:
      return Object.assign({}, state, {
        fetchingBatchList: true
      })
    case t.RECEIVE_BATCH_LIST:
      return Object.assign({}, state, {
        fetchingBatchList: false,
        batchList: action.batchList
      })
    case t.RECEIVE_BATCH_LIST_ERROR:
      return Object.assign({}, state, {
        fetchingBatchList: false,
        batchList: []
      })
    case t.REQUEST_BATCH_ITEM:
      return Object.assign({}, state, {
        fetchingBatchItem: true
      })
    case t.RECEIVE_BATCH_ITEM:
      return Object.assign({}, state, {
        fetchingBatchItem: false,
        batchItem: action.batchItem
      })
    case t.RECEIVE_BATCH_ITEM_ERROR:
      return Object.assign({}, state, {
        fetchingBatchItem: false,
        batchItem: {}
      })
    case t.PRODUCT_BATCH_UPLOAD_START:
      return Object.assign({}, state, {
        uploadingBatchFile: true
      })
    case t.PRODUCT_BATCH_UPLOAD_END:
      return Object.assign({}, state, {
        uploadingBatchFile: false
      })
    case t.PRODUCT_SET_CATEGORY_SUCCESS:
    case t.PRODUCT_DELETE_SUCCESS:
    default:
      return state
  }
}
