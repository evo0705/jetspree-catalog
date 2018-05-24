import React from "react"
import { TableRow, TableRowColumn } from "material-ui/Table"
import { Link } from "react-router-dom"
import moment from "moment"

const bytesToSize = (bytes) => {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes == 0) return "0 Byte"
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i]
}

const BatchListItem = ({ batchItem }) => {
  return (
    <TableRow>
      <TableRowColumn>
        <Link to={ `/admin/create-batches/${batchItem._id}` }>
          { batchItem.file_name }
        </Link>
      </TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>{ bytesToSize(batchItem.file_size) }</TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>{ batchItem.status }</TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>
        {
          batchItem.date_uploaded ?
            <div>
              <div>{moment(batchItem.date_uploaded).format('MMMM Do YYYY')}</div>
              <div>{moment(batchItem.date_uploaded).format('h:mm:ss a')}</div>
            </div>
          : null
        }
      </TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>
        {
          batchItem.date_started ?
            <div>
              <div>{moment(batchItem.date_started).format('MMMM Do YYYY')}</div>
              <div>{moment(batchItem.date_started).format('h:mm:ss a')}</div>
            </div>
          : null
        }
      </TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>
        {
          batchItem.date_parsed ?
            <div>
              <div>{moment(batchItem.date_parsed).format('MMMM Do YYYY')}</div>
              <div>{moment(batchItem.date_parsed).format('h:mm:ss a')}</div>
            </div>
          : null
        }
      </TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>
        {
          batchItem.date_stopped ?
            <div>
              <div>{moment(batchItem.date_stopped).format('MMMM Do YYYY')}</div>
              <div>{moment(batchItem.date_stopped).format('h:mm:ss a')}</div>
            </div>
          : null
        }
      </TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>
        {
          batchItem.date_completed ?
            <div>
              <div>{moment(batchItem.date_completed).format('MMMM Do YYYY')}</div>
              <div>{moment(batchItem.date_completed).format('h:mm:ss a')}</div>
            </div>
          : null
        }
      </TableRowColumn>
    </TableRow>
  )
}

export default BatchListItem
