import React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { uploadBatchFile } from "../actions"
import Uploader from "./components/Uploader"
import Divider from "material-ui/Divider/index"
import Subheader from "material-ui/Subheader/index"
import styles from "./NewCreateBatchesPage.css"

class NewCreateBatchesPage extends React.Component {
  constructor(props) {
    super(props)
    this.onFileUpload = this.onFileUpload.bind(this)
  }

  componentWillReceiveProps(props) {
    const { batchItem } = props
    if (batchItem._id) {
      this.navigateToBatchDetail(batchItem._id)
    }
  }

  navigateToBatchDetail(batchID) {
    const { history } = this.props
    history.push(`/admin/create-batches/${batchID}`)
  }

  onFileUpload(fileData) {
    this.props.onUploadFile(fileData)
  }

  render() {
    const { uploading } = this.props

    return (
      <div className={styles.newBatchContainer}>
        <Subheader>Upload New Products</Subheader>
        <Divider/>
        <Uploader uploading={uploading} onUpload={this.onFileUpload}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    uploading: state.batches.uploadingBatchFile,
    batchItem: state.batches.batchUploadItem,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onUploadFile: (formData) => {
      dispatch(uploadBatchFile(formData))
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewCreateBatchesPage))
