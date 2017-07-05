import React from 'react';

import { ListItem } from 'material-ui/List';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import { amberA700 } from 'material-ui/styles/colors';

import IconName from 'material-ui/svg-icons/image/edit';

export default class NameComponent extends React.Component {
    
    state = {
        open: false,
        name: ''
    }
    
    _handleOpen = () => {
        this.setState({open: true, name: this.props.name});
    }
    _handleClose = () => {
        this.setState({open: false});
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
            <FlatButton label='Name'
                        primary={true}
                        keyboardFocused={true}
                        onTouchTap={this._handleSubmit}
                        style={{color:amberA700}}
            />];

        return (
            <div>
                <ListItem primaryText={this.props.name}
                          onTouchTap={this._handleOpen}
                          rightIcon={<IconName color={amberA700}/>}/>
                <Dialog title='enter new name'
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this._handleClose}>
                    <TextField id='name'
                               value={this.state.name}
                               onChange={this._handleKey}
                               underlineFocusStyle={{borderColor:amberA700}}/>
                </Dialog>
            </div>
        );
    }
}