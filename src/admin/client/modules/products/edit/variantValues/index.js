import { connect } from "react-redux"
import { withRouter } from "react-router"
import VariantList from "./components/VariantList"

const mapStateToProps = (state, ownProps) => {
  const { productId } = ownProps.match.params
console.log(state.products)
  return {
    variantValues:  state.products.editProduct ? state.products.editProduct.variant_values : null,
    productId: productId,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return { }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VariantList))
