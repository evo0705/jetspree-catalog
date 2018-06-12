import { connect } from "react-redux"
import { withRouter } from "react-router"
import MetaDataList from "./components/list"

const mapStateToProps = (state, ownProps) => {
  return {
    metadata: state.products.editProduct ? state.products.editProduct.metadata : null,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MetaDataList))
