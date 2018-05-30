import React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { uploadDeleteProductsFile } from "../actions"
import Uploader from "./components/Uploader"
import Divider from "material-ui/Divider/index"
import Subheader from "material-ui/Subheader/index"
import styles from "./NewProductDeleteFilesPage.css"
import products from "../reducer"

class NewProductDeleteFilesPage extends React.Component {
  constructor(props) {
    super(props)
    this.onUploadDeleteProductsFile = this.onUploadDeleteProductsFile.bind(this)
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
    history.push(`/admin/products/delete-files/${batchID}`)
  }

  onUploadDeleteProductsFile(fileData) {
    this.props.onUploadDeleteProductsFile(fileData)
  }

  render() {
    const { uploading } = this.props

    return (
      <div className={styles.newBatchContainer}>
        <Subheader>Upload CSV Files</Subheader>
        <Divider/>
        <Uploader uploading={uploading} buttonLabel="Delete Products" onUpload={this.onUploadDeleteProductsFile}/>
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
    onUploadDeleteProductsFile: (formData) => {
      dispatch(uploadDeleteProductsFile(formData))
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewProductDeleteFilesPage))
