import React from 'react';
import { ListItem } from 'material-ui/List';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

export default class JoinComponent extends React.Component {
	state = {
		open: false,
		room: 'first_game'
	};

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false, room: 'first_game'});
  };
	
	handleJoin = () => {
		this.props._joinGame(this.state.room);
		this.handleClose();
	};
	
	handleKey = (e) => {
		this.setState({room: e.target.value});
	};

  render() {
    const actions = [
      <FlatButton
        label='Cancel'
        primary={false}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label='Join'
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleJoin}
      />,
    ];

    return (
      <div>
				<ListItem primaryText='join room' onTouchTap={this.handleOpen} />
        <Dialog
          title='enter room name'
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}>
					<TextField id='room_name' value={this.state.room} onChange={this.handleKey} />
        </Dialog>
      </div>
    );
  }
};