import React from 'react';

import { ListItem } from 'material-ui/List';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

export default class NameComponent extends React.Component {
	state = {
		open: false,
		name: ''
	}
    
    _handleOpen = () => {
        this.setState({open: true});
    }
    
    _handleClose = () => {
        this.setState({open: false, name: ''});
    }
	_handleSubmit = () => {
		this.props._setName(this.state.name);
		this._handleClose();
	}
	
	_handleKey = (e) => {
		this.setState({name: e.target.value});
	}
    
    render() {
        const actions = [
            <FlatButton label='Cancel'
                        primary={false}
                        onTouchTap={this._handleClose}
            />,
            <FlatButton label='Submit'
                        primary={true}
                        keyboardFocused={true}
                        onTouchTap={this._handleSubmit}
            />];

        return (
            <div>
                <ListItem primaryText={this.props.name}
                          onTouchTap={this._handleOpen}/>
                <Dialog title='enter new display name'
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this._handleClose}>
                    <TextField id='name'
                               value={this.state.name}
                               onChange={this._handleKey}/>
                </Dialog>
            </div>
        );
    }
}