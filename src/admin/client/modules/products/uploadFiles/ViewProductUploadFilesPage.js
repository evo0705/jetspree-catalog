import React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { Link } from "react-router-dom"
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn,
} from "material-ui/Table"
import Subheader from "material-ui/Subheader"
import Divider from "material-ui/Divider"
import LinearProgress from "material-ui/LinearProgress"
import ErrorItem from "./components/ErrorItem"
import { fetchProductUploadFileByID } from "../actions"
import messages from "lib/text"
import styles from "./ViewProductUploadFilesPage.css"
import moment from "moment"
import products from "../reducer"

class ViewProductUploadFilesPage extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.fetchProductUploadFileByID()
    this.pollBatchItem()
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  batchDateTime(batchDate) {
    if(!batchDate) {
      return "N/A"
    }
    return moment(batchDate).format("MMMM Do YYYY h:mm:ss a")
  }

  pollBatchItem() {
    const FIVE_SECONDS = 5000
    const { batchItem } = this.props

    this.intervalId = setInterval(() => {
      if (batchItem.status !== "aborted" && batchItem.status !== "completed") {
        this.props.fetchProductUploadFileByID()
      } else {
        clearInterval(this.intervalId)
      }
    }, FIVE_SECONDS)
  }

  render() {
    const { batchItem } = this.props

    let linearProgressIndicator
    if (batchItem.status !== "aborted" && batchItem.status !== "completed") {
      linearProgressIndicator = <LinearProgress mode="indeterminate"/>
    }

    let errorTitleNode, errorsNode
    if (batchItem.errors && batchItem.errors.length > 0) {
      errorTitleNode = <TableRow className={styles.errorMessageRow}>
        <TableRowColumn colSpan={2} className={styles.errorMessageColumn}>{'Error Messages'}</TableRowColumn>
      </TableRow>
      errorsNode = batchItem.errors.map(error => {
        return (
          <ErrorItem error={error}/>
        )
      })
    }

    return (
      <div className={styles.batchDetailContainer}>
        <Subheader>Batch Upload Products</Subheader>
        {linearProgressIndicator}
        <Divider/>
        <Table className={styles.batchDetailTable}>
          <TableBody displayRowCheckbox={false}>
            <TableRow>
              <TableRowColumn>{messages.batch_file_name}</TableRowColumn>
              <TableRowColumn>
                <Link to={batchItem.file_url ? batchItem.file_url : "#"} target="_blank">
                  {batchItem.file_name}
                </Link>
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_file_size}</TableRowColumn>
              <TableRowColumn>{batchItem.file_size}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_status}</TableRowColumn>
              <TableRowColumn>{batchItem.status}</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_uploaded_at}</TableRowColumn>
              <TableRowColumn>
                {this.batchDateTime(batchItem.date_uploaded)}
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_started_at}</TableRowColumn>
              <TableRowColumn>
                {this.batchDateTime(batchItem.date_started)}
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_parsed_at}</TableRowColumn>
              <TableRowColumn>
                {this.batchDateTime(batchItem.date_parsed)}
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_stopped_at}</TableRowColumn>
              <TableRowColumn>
                {this.batchDateTime(batchItem.date_stopped)}
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_completed_at}</TableRowColumn>
              <TableRowColumn>
                {this.batchDateTime(batchItem.date_completed)}
              </TableRowColumn>
            </TableRow>
            {errorTitleNode}
            {errorsNode}
          </TableBody>
        </Table>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    fetching:  state.products.fetchingBatchItem,
    batchItem: state.products.batchItem,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchProductUploadFileByID: () => {
      const { id } = ownProps.match.params
      dispatch(fetchProductUploadFileByID(id))
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewProductUploadFilesPage))
