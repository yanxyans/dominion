import React from 'react';

import { ListItem } from 'material-ui/List';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import { amberA700 } from 'material-ui/styles/colors';

import IconRoom from 'material-ui/svg-icons/places/casino';

export default class JoinComponent extends React.Component {
    state = {
        open: false,
        room: 'first game'
    }

    _handleOpen = () => {
        this.setState({open: true});
    }
    _handleClose = () => {
        this.setState({open: false, room: 'first game'});
    }
    _handleJoin = () => {
        this.props._joinRoom(this.state.room);
        this._handleClose();
    }
    
    _handleKey = (e) => {
        this.setState({room: e.target.value});
    }

    render() {
        const actions = [
            <FlatButton label='Cancel'
                        primary={false}
                        onTouchTap={this._handleClose}
            />,
            <FlatButton label='Join'
                        primary={true}
                        keyboardFocused={true}
                        onTouchTap={this._handleJoin}
                        style={{color:amberA700}}
            />];

        return (
            <div>
                <ListItem primaryText='join room'
                          onTouchTap={this._handleOpen}
                          rightIcon={<IconRoom color={amberA700}/>}/>
                <Dialog title='enter room name'
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this._handleClose}>
                    <TextField id='room'
                               value={this.state.room}
                               onChange={this._handleKey}
                               underlineFocusStyle={{borderColor:amberA700}}/>
                </Dialog>
            </div>
        );
    }
}