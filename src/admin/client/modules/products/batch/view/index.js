import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import BatchItem from './components/batchItem'
import { fetchBatchItem } from '../../actions'

const mapStateToProps = (state, ownProps) => {
  return {
    fetching: state.products.fetchingBatchItem,
    batchItem: state.products.batchItem
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchBatchItem: () => {
      const { batchId } = ownProps.match.params;
      dispatch(fetchBatchItem(batchId));
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BatchItem));
