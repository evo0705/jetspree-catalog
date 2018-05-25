import React from "react"
import {
  TableRow,
  TableRowColumn,
} from "material-ui/Table"
import styles from "./ErrorItem.css"

const ErrorItem = ({ error }) => {
  return (
    <TableRow>
      <TableRowColumn className={styles.lineNoColumn}>Line #{error.row_no}</TableRowColumn>
      <TableRowColumn className={styles.errorFieldColumn}>
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
