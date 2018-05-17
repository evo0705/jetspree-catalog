import React from 'react';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow } from 'material-ui/Table';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import BatchListItem from './item'
import messages from 'lib/text'
import style from './style.css'

export default class ProductsList extends React.Component {
  constructor(props){
    super(props);
  }

  componentDidMount(){
    this.props.fetchBatchList();
  }

  render(){
    const { batchList } = this.props;

    const rows =  batchList.map((item, index) => {
      return (
        <BatchListItem key={index} batchItem={item} />
      )
    });

    return (
      <div className={style.batchList}>
        <Subheader>{message.batchProcessTitle}</Subheader>
        <Divider />
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>{message.batch_file_name}</TableHeaderColumn>
              <TableHeaderColumn>{message.batch_file_size}</TableHeaderColumn>
              <TableHeaderColumn>{message.batch_status}</TableHeaderColumn>
              <TableHeaderColumn>{message.batch_message}</TableHeaderColumn>
              <TableHeaderColumn>{message.batch_uploaded_at}</TableHeaderColumn>
              <TableHeaderColumn>{message.batch_started_at}</TableHeaderColumn>
              <TableHeaderColumn>{message.batch_parsed_at}</TableHeaderColumn>
              <TableHeaderColumn>{message.batch_stopped_at}</TableHeaderColumn>
              <TableHeaderColumn>{message.batch_completed_at}</TableHeaderColumn>
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
