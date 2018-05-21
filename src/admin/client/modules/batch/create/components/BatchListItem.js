import React from "react"
import { TableRow, TableRowColumn } from "material-ui/Table"
import { Link } from "react-router-dom"
import moment from "moment"

const BatchListItem = ({ batchItem }) => {
  return (
    <TableRow>
      <TableRowColumn>
        <Link to={ `/admin/create-batches/${batchItem._id}` }>
          { batchItem.file_name }
        </Link>
      </TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>{ batchItem.file_size }</TableRowColumn>
      <TableRowColumn style={{textAlign: 'center'}}>{ batchItem.status }</TableRowColumn>
      <TableRowColumn>{ batchItem.error_message }</TableRowColumn>
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
