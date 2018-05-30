import React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { uploadCreateProductsFile, uploadDeleteProductsFile } from "../actions"
import Uploader from "./components/Uploader"
import Divider from "material-ui/Divider/index"
import Subheader from "material-ui/Subheader/index"
import styles from "./NewProductUploadFilesPage.css"
import products from "../reducer"

class NewProductUploadFilesPage extends React.Component {
  constructor(props) {
    super(props)
    this.onUploadCreateProductsFile = this.onUploadCreateProductsFile.bind(this)
  }

  componentWillReceiveProps(props) {
    const { batchItem } = props
    console.log(props)
    if (batchItem._id) {
      this.navigateToBatchDetail(batchItem._id)
    }
  }

  navigateToBatchDetail(batchID) {
    const { history } = this.props
    history.push(`/admin/create-batches/${batchID}`)
  }

  onUploadCreateProductsFile(fileData) {
    this.props.onUploadCreateProductsFile(fileData)
  }

  render() {
    const { uploading } = this.props

    return (
      <div className={styles.newBatchContainer}>
        <Subheader>Upload CSV Files</Subheader>
        <Divider/>
        <Uploader uploading={uploading} onUpload={this.onUploadCreateProductsFile}/>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    uploading: state.products.uploadingBatchFile,
    batchItem: state.products.batchUploadItem,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onUploadCreateProductsFile: (formData) => {
      dispatch(uploadCreateProductsFile(formData))
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewProductUploadFilesPage))
