import React from "react"
import {
  TableRow,
  TableRowColumn,
} from "material-ui/Table"
import style from "../style.css"

const ErrorItem = ({ error }) => {
  return(
    <TableRow>
      <TableRowColumn style={{verticalAlign: "text-top", padding: "15px 24px"}}>Line #{error.row_no}</TableRowColumn>
      <TableRowColumn style={{padding: "15px 24px", lineHeight: "20px"}}>
        {
          error.errors.map((columnError, index) => {
            return (
              <div>
                <strong>Column #{columnError.column_no} {columnError.column_name}: </strong>
                <italic>{columnError.error_messages.join()}</italic>
              </div>
            )
          })
        }
      </TableRowColumn>
    </TableRow>
  )
}

export default ErrorItem
