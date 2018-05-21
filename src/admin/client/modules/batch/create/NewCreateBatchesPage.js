import React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { uploadBatchFile } from "../actions"
import Uploader from "./components/uploader"

class NewCreateBatchesPage extends React.Component {
  constructor(props) {
    super(props)
    this.onFileUpload = this.onFileUpload.bind(this)
  }

  onFileUpload(fileData) {
    this.props.onUploadFile(fileData)
  }

  render() {
    const { uploading, fileName } = this.props

    return (
      <div>
        <Uploader uploading={uploading} fileName={fileName} onUpload={this.onFileUpload} />
      </div>
  )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    uploading: state.batches.uploadingBatchFile,
    fileName:  null,
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
