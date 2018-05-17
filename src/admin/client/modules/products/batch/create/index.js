import React from 'react'
import messages from 'lib/text'
import Uploader from './components/uploader'

class BatchCreatePage extends React.Component {
  constructor(props) {
    super(props);
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

import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { uploadBatchFile } from '../../actions'

const mapStateToProps = (state, ownProps) => {
  return {
    uploading: state.products.uploadingBatchFile,
    fileName: null
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onUploadFile: (formData) => {
      dispatch(uploadBatchFile(formData));
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BatchCreatePage));
