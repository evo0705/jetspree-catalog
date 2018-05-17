import React from 'react'
import { Link } from 'react-router-dom'
import messages from 'lib/text'
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
const Fragment = React.Fragment;

export default class Buttons extends React.Component {
  render() {
    const { onCreate } = this.props;

    return (
      <Fragment>
        <IconButton touch={true} tooltipPosition="bottom-left" tooltip={messages.batchCreateProducts} onClick={onCreate}>
          <FontIcon color="#fff" className="material-icons">create_new_folder</FontIcon>
        </IconButton>
      </Fragment>
    )
  }
}
