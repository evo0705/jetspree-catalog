import React from "react"
import { connect } from "react-redux"
import { withRouter } from "react-router"
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow } from "material-ui/Table"
import Subheader from "material-ui/Subheader"
import Divider from "material-ui/Divider"
import DropDownMenu from "material-ui/DropDownMenu"
import MenuItem from "material-ui/MenuItem"
import BatchListItem from "./components/BatchListItem"
import { fetchProductUpdateFiles } from "../actions"
import messages from "lib/text"
import styles from "./ListProductUpdateFilesPage.css"
import products from "../reducer"

const sortByMenuList = [
  { label: "Date Uploaded (DESC)", value: "date_uploaded_desc", field: "date_uploaded", sortType: -1 },
  { label: "Date Uploaded (ASC)", value: "date_uploaded_asc", field: "date_uploaded", sortType: 1 },
  { label: "Status (DESC)", value: "status_desc", field: "status", sortType: -1 },
  { label: "Status (ASC)", value: "status_asc", field: "status", sortType: 1 },
]

class ListProductUpdateFilesPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortBy: "date_uploaded_desc",
    }
    this.onSortChange = this.onSortChange.bind(this)
  }

  componentDidMount() {
    const sortQuery = {
      sortField: "date_uploaded",
      sortType:  -1,
    }
    this.props.fetchBatchList(sortQuery)
  }

  onSortChange(event, index, value) {
    const sortItem = sortByMenuList.find(sortItem => sortItem.value === value)
    const sortQuery = {
      sortField: sortItem.field,
      sortType:  sortItem.sortType,
    }
    this.props.fetchBatchList(sortQuery)
    this.setState({ sortBy: value })
  }

  render() {
    const { sortBy } = this.state
    const { batchList } = this.props

    const rows = batchList.map(item => {
      return (
        <BatchListItem key={item._id} batchItem={item}/>
      )
    })

    const sortByMenu = sortByMenuList.map((menu, index) => {
      return (
        <MenuItem key={`sort-item-${index}`} value={menu.value} primaryText={menu.label}/>
      )
    })

    return (
      <div className={styles.batchList}>
        <Subheader>
          {messages.batch_update_products}
          <DropDownMenu value={sortBy} onChange={this.onSortChange} className={styles.sortMenu}>
            {sortByMenu}
          </DropDownMenu>
        </Subheader>
        <Divider/>
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn className={styles.batchListHeaderColumn}>{messages.batch_file_name}</TableHeaderColumn>
              <TableHeaderColumn className={styles.batchListHeaderColumn}>{messages.batch_file_size}</TableHeaderColumn>
              <TableHeaderColumn className={styles.batchListHeaderColumn}>{messages.batch_status}</TableHeaderColumn>
              <TableHeaderColumn className={styles.batchListHeaderColumn}>{messages.batch_uploaded_at}</TableHeaderColumn>
              <TableHeaderColumn className={styles.batchListHeaderColumn}>{messages.batch_started_at}</TableHeaderColumn>
              <TableHeaderColumn className={styles.batchListHeaderColumn}>{messages.batch_parsed_at}</TableHeaderColumn>
              <TableHeaderColumn className={styles.batchListHeaderColumn}>{messages.batch_stopped_at}</TableHeaderColumn>
              <TableHeaderColumn className={styles.batchListHeaderColumn}>{messages.batch_completed_at}</TableHeaderColumn>
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
    fetching:  state.products.fetchingBatchList,
    batchList: state.products.batchList,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchBatchList: (query) => {
      dispatch(fetchProductUpdateFiles(query))
    },
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ListProductUpdateFilesPage))
