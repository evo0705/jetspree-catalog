import { connect } from "react-redux"
import { withRouter } from "react-router"
import MetaInformationList from "./components/list"

const mapStateToProps = (state, ownProps) => {
  return {
    metaInformation: state.products.editProduct ? state.products.editProduct.meta_information : null,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MetaInformationList))
