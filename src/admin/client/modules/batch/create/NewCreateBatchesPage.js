import React from "react"
import { connect } from "react-redux"
import { withRouter, Redirect } from "react-router"
import { uploadBatchFile } from "../actions"
import Uploader from "./components/Uploader"
import style from "./style.css"
import Divider from "material-ui/Divider/index"
import Subheader from "material-ui/Subheader/index"

class NewCreateBatchesPage extends React.Component {
  constructor(props) {
    super(props)
    this.onFileUpload = this.onFileUpload.bind(this)
  }

  componentWillReceiveProps(props) {
    if(props.batchItem._id) {
      window.location = `/admin/create-batches/${props.batchItem._id}`
    }
  }

  onFileUpload(fileData) {
    this.props.onUploadFile(fileData)
  }

  render() {
    const { uploading } = this.props

    return (
      <div className={style.batchContainer}>
        <Subheader>Upload New Products</Subheader>
        <Divider />
        <Uploader uploading={uploading} onUpload={this.onFileUpload} />
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
