import React from "react"
import { TableRow, TableRowColumn } from "material-ui/Table"
import { Link } from "react-router-dom"
import moment from "moment"

const batchItemColumnStyle = {
  textAlign: "center"
}

const bytesToSize = (bytes) => {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes == 0) return "0 Byte"
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i]
}

const BatchDateTime = ({ batchDate }) => {
  return (
    batchDate ?
      <div>
        <div>{moment(batchDate).format("MMMM Do YYYY")}</div>
        <div>{moment(batchDate).format("h:mm:ss a")}</div>
      </div>
      : null
  )
}

const BatchListItem = ({ batchItem }) => {
  return (
    <TableRow>
      <TableRowColumn>
        <Link to={`/admin/create-batches/${batchItem._id}`}>
          {batchItem.file_name}
        </Link>
      </TableRowColumn>
      <TableRowColumn style={batchItemColumnStyle}>{bytesToSize(batchItem.file_size)}</TableRowColumn>
      <TableRowColumn style={batchItemColumnStyle}>{batchItem.status}</TableRowColumn>
      <TableRowColumn style={batchItemColumnStyle}>
        <BatchDateTime batchDate={batchItem.date_uploaded}/>
      </TableRowColumn>
      <TableRowColumn style={batchItemColumnStyle}>
        <BatchDateTime batchDate={batchItem.date_started}/>
      </TableRowColumn>
      <TableRowColumn style={batchItemColumnStyle}>
        <BatchDateTime batchDate={batchItem.date_parsed}/>
      </TableRowColumn>
      <TableRowColumn style={batchItemColumnStyle}>
        <BatchDateTime batchDate={batchItem.date_stopped}/>
      </TableRowColumn>
      <TableRowColumn style={batchItemColumnStyle}>
        <BatchDateTime batchDate={batchItem.date_completed}/>
      </TableRowColumn>
    </TableRow>
  )
}

export default BatchListItem
