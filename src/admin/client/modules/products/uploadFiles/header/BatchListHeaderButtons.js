import React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import messages from "lib/text"
import FontIcon from "material-ui/FontIcon"
import IconButton from "material-ui/IconButton"

const Fragment = React.Fragment

class BatchListHeaderButtons extends React.Component {
  render() {
    const { onCreate } = this.props

    return (
      <Fragment>
        <IconButton touch={true} tooltipPosition="bottom-left" tooltip={messages.batchCreateProducts} onClick={onCreate}>
          <FontIcon color="#fff" className="material-icons">create_new_folder</FontIcon>
        </IconButton>
      </Fragment>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onCreate: () => {
      ownProps.history.push("/admin/products/upload-files/new")
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BatchListHeaderButtons))
