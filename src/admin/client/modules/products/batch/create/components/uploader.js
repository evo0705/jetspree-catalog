import React from 'react';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Dropzone from 'react-dropzone';
import Snackbar from 'material-ui/Snackbar';
import RaisedButton from 'material-ui/RaisedButton';
import messages from 'lib/text';

export default class Uploader extends React.Component {
  onDrop = files => {
    this.setState({
      uploading: true
    })
    let form = new FormData();
    files.map(file => { form.append('file', file) })
    this.props.onUpload(form);
  }

  render(){
    const { uploading = false, fileName } = this.props;

    return (
      <div>
        <Dropzone
          onDrop={this.onDrop}
          multiple={false}
          disableClick={true}
          accept="text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          ref={(node) => { this.dropzone = node; }}>
          {fileName}
        </Dropzone>
        <RaisedButton primary={true} label={messages.chooseImage} disabled={uploading} style={{ marginLeft:20, marginTop:10 }} onClick={() => { this.dropzone.open() }} />
        <Snackbar
          open={uploading}
          message={messages.messages_uploading}
        />
      </div>
    )
  }
}
