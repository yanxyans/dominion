import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

export default class MenuComponent extends React.Component {
  constructor(props) {
    super(props);
		this.state = {
			displayDialog: false,
			newName: ''
		}
		
		this.handleOpen = this.handleOpen.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleSetName = this.handleSetName.bind(this);
		this.handleKeyName = this.handleKeyName.bind(this);
  }

  handleOpen() {
    this.setState({
			displayDialog: true
		});
  }

  handleClose() {
    this.setState({
			displayDialog: false,
			newName: ''
		});
  }
	
	handleSetName() {
		this.props.setName(this.state.newName);
		this.handleClose();
	}
	
	handleKeyName(e) {
		this.setState({
			newName: e.target.value
		});
	}

  render() {
    const actions = [
      <FlatButton
        label='Cancel'
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label='Set'
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleSetName}
      />,
    ]

    return (
      <List>
        <ListItem primaryText={this.props.name} onTouchTap={this.handleOpen} />
        <Dialog
          title="Set Display Name"
          actions={actions}
          modal={false}
          open={this.state.displayDialog}
          onRequestClose={this.handleClose}>
          <TextField id='newName' value={this.state.newName} onChange={this.handleKeyName} />
        </Dialog>
      </List>
    )
  }
}