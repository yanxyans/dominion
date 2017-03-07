import React from 'react';
import { ListItem } from 'material-ui/List';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

export default class NameComponent extends React.Component {
	state = {
		open: false,
		newName: ''
	};

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({
			open: false,
			newName: ''
		});
  };
	
	handleSet = () => {
		this.props.setName(this.state.newName);
		this.handleClose();
	};
	
	handleKey = (e) => {
		this.setState({newName: e.target.value});
	};

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
        onTouchTap={this.handleSet}
      />,
    ];

    return (
      <div>
				<ListItem primaryText={'name = ' + this.props.name} onTouchTap={this.handleOpen} />
        <Dialog
          title='set display name'
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}>
					<TextField id='newName' value={this.state.newName} onChange={this.handleKey} />
        </Dialog>
      </div>
    );
  }
}