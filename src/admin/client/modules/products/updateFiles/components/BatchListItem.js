import React from "react"
import { TableRow, TableRowColumn } from "material-ui/Table"
import { Link } from "react-router-dom"
import moment from "moment"
import styles from "./BatchListItem.css"

class BatchListItem extends React.Component {
  constructor(props) {
    super(props)
  }

  bytesToSize(bytes){
    var sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    if (bytes == 0) return "0 Byte"
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i]
  }

  batchDateTime(batchDate) {
    if(!batchDate) {
      return "N/A"
    }
    return moment(batchDate).format("MMMM Do YYYY, h:mm:ss a")
  }

  render() {
    const { batchItem } = this.props

    return (
      <TableRow>
        <TableRowColumn>
          <Link to={`/admin/products/update-files/${batchItem._id}`}>
            {batchItem.file_name}
          </Link>
        </TableRowColumn>
        <TableRowColumn className={styles.batchItemColumn}>{this.bytesToSize(batchItem.file_size)}</TableRowColumn>
        <TableRowColumn className={styles.batchItemColumn}>{batchItem.status}</TableRowColumn>
        <TableRowColumn className={styles.batchDateItemColumn}>
          {this.batchDateTime(batchItem.date_uploaded)}
        </TableRowColumn>
        <TableRowColumn className={styles.batchDateItemColumn}>
          {this.batchDateTime(batchItem.date_started)}
        </TableRowColumn>
        <TableRowColumn className={styles.batchDateItemColumn}>
          {this.batchDateTime(batchItem.date_parsed)}
        </TableRowColumn>
        <TableRowColumn className={styles.batchDateItemColumn}>
          {this.batchDateTime(batchItem.date_stopped)}
        </TableRowColumn>
        <TableRowColumn className={styles.batchDateItemColumn}>
          {this.batchDateTime(batchItem.date_completed)}
        </TableRowColumn>
      </TableRow>
    )
  }
}
export default BatchListItem
