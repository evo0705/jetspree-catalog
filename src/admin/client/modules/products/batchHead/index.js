import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { batchCreate } from '../actions'
import Buttons from './components/buttons'

const mapStateToProps = (state, ownProps) => {
  return {
    
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onCreate: () => {
      ownProps.history.push('/admin/products/batch/create');
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Buttons));
