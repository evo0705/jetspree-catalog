import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import List from './components/list'
import { fetchBatchList } from '../../actions'

const mapStateToProps = (state, ownProps) => {
  return {
    fetching: state.products.fetchingBatchList,
    batchList: state.products.batchList
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchBatchList: () => {
      dispatch(fetchBatchList());
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(List));
