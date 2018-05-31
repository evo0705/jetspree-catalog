import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { fetchProducts, deleteProducts, setCategory, setFilter, createProduct } from '../actions'
import Buttons from './components/buttons'

const mapStateToProps = (state, ownProps) => {
  return {
    search: state.products.filter.search,
    selectedCount: state.products.selected.length
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setSearch: (event, value) => {
      dispatch(setFilter({ search: value }));
      dispatch(fetchProducts());
    },
    onDelete: () => {
      dispatch(deleteProducts());
    },
    onMoveTo: (category_id) => {
      dispatch(setCategory(category_id));
    },
    onCreate: () => {
      dispatch(createProduct(ownProps.history))
    },
    onProductUploadFilesClicked: () => {
      ownProps.history.push('/admin/products/upload-files');
    },
    onProductDeleteFilesClicked: () => {
      ownProps.history.push('/admin/products/delete-files');
    },
    onProductUpdateFilesClicked: () => {
      ownProps.history.push('/admin/products/update-files');
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Buttons));
