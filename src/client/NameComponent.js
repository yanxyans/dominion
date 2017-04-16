import React from 'react';
import { ListItem } from 'material-ui/List';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

export default class NameComponent extends React.Component {
	state = {
		open: false,
		name: ''
	};

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false, name: ''});
  };
	
	handleSet = () => {
		this.props._setName(this.state.name);
		this.handleClose();
	};
	
	handleKey = (e) => {
		this.setState({name: e.target.value});
	};

  render() {
    const actions = [
      <FlatButton
        label='Cancel'
        primary={false}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label='Change'
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleSet}
      />,
    ];

    return (
      <div>
				<ListItem primaryText={'name=' + this.props.name} onTouchTap={this.handleOpen} />
        <Dialog
          title='enter display name'
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}>
					<TextField id='name' value={this.state.name} onChange={this.handleKey} />
        </Dialog>
      </div>
    );
  }
};