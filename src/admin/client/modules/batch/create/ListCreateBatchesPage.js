import React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow } from "material-ui/Table"
import Subheader from "material-ui/Subheader"
import Divider from "material-ui/Divider"
import BatchListItem from "./components/BatchListItem"
import { fetchBatchList } from "../actions"
import messages from "lib/text"
import style from "./style.css"

class ListCreateBatchesPage extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.fetchBatchList()
  }

  render() {
    const { batchList } = this.props

    const rows = batchList.map((item, index) => {
      return (
        <BatchListItem key={index} batchItem={item}/>
      )
    });

    return (
      <div className={style.batchList}>
        <Subheader>{messages.batch_process_title}</Subheader>
        <Divider />
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>{messages.batch_file_name}</TableHeaderColumn>
              <TableHeaderColumn>{messages.batch_file_size}</TableHeaderColumn>
              <TableHeaderColumn>{messages.batch_status}</TableHeaderColumn>
              <TableHeaderColumn>{messages.batch_message}</TableHeaderColumn>
              <TableHeaderColumn>{messages.batch_uploaded_at}</TableHeaderColumn>
              <TableHeaderColumn>{messages.batch_started_at}</TableHeaderColumn>
              <TableHeaderColumn>{messages.batch_parsed_at}</TableHeaderColumn>
              <TableHeaderColumn>{messages.batch_stopped_at}</TableHeaderColumn>
              <TableHeaderColumn>{messages.batch_completed_at}</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows}
          </TableBody>
        </Table>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    fetching:  state.batches.fetchingBatchList,
    batchList: state.batches.batchList,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchBatchList: () => {
      dispatch(fetchBatchList())
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ListCreateBatchesPage))
