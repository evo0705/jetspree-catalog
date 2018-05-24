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
import { fetchBatchItem } from "../actions"
import messages from "lib/text"
import style from "./style.css"
import moment from "moment"

class ViewCreateBatchesPage extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.fetchBatchItem()
    this.pollBatchItem()
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  pollBatchItem() {
    const FIVE_SECONDS = 5000
    const { batchItem } = this.props

    this.intervalId = setInterval(() => {
      if(batchItem.status !== "aborted" || batchItem.status !== "completed") {
        this.props.fetchBatchItem()
      } else {
        clearInterval(this.intervalId)
      }
    }, FIVE_SECONDS)
  }

  render() {
    const { batchItem } = this.props

    const LinearProgressIndicator = () => (
      <LinearProgress mode='indeterminate'/>
    );

    return (
      <div className={style.batchDetailContainer}>
        <Subheader>Batch Upload Products</Subheader>
          {
            batchItem.status !== 'aborted' || batchItem.status === "completed" ?
              <LinearProgressIndicator/>
            : null
          }
        <Divider />
        <Table style={{tableLayout: "auto"}}>
          <TableBody displayRowCheckbox={false}>
            <TableRow>
              <TableRowColumn>{messages.batch_file_name}</TableRowColumn>
              <TableRowColumn>
                <Link to={ batchItem.file_url ? batchItem.file_url : '#' } target="_blank">
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
                { batchItem.date_uploaded ? moment(batchItem.date_uploaded).format('MMMM Do YYYY h:mm:ss a') : 'N/A' }
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_started_at}</TableRowColumn>
              <TableRowColumn>
                { batchItem.date_started ? moment(batchItem.date_started).format('MMMM Do YYYY h:mm:ss a') : 'N/A' }
            </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_parsed_at}</TableRowColumn>
              <TableRowColumn>
                { batchItem.date_parsed ? moment(batchItem.date_parsed).format('MMMM Do YYYY h:mm:ss a') : 'N/A' }
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_stopped_at}</TableRowColumn>
              <TableRowColumn>
                { batchItem.date_stopped ? moment(batchItem.date_stopped).format('MMMM Do YYYY h:mm:ss a') : 'N/A' }
              </TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>{messages.batch_completed_at}</TableRowColumn>
              <TableRowColumn>
                { batchItem.date_completed ? moment(batchItem.date_completed).format('MMMM Do YYYY h:mm:ss a') : 'N/A' }
              </TableRowColumn>
            </TableRow>
            {
              batchItem.errors && batchItem.errors.length > 0 ?
                <TableRow style={{borderWidth: 0}}>
                  <TableRowColumn colSpan={2} style={{textAlign: "center"}}>Error Messages</TableRowColumn>
                </TableRow>
              : null
            }
            {
              batchItem.errors && batchItem.errors.length > 0 ?
                batchItem.errors.map(error => {
                  return (
                    <ErrorItem error = { error }/>
                  )
                })
              : 'N/A'
            }
          </TableBody>
        </Table>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    fetching:  state.batches.fetchingBatchItem,
    batchItem: state.batches.batchItem,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchBatchItem: () => {
      const { batchId } = ownProps.match.params
      dispatch(fetchBatchItem(batchId))
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewCreateBatchesPage))
