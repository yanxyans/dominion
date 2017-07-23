import React from 'react';

import { ListItem } from 'material-ui/List';
import Dialog from 'material-ui/Dialog';

import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

export default class DialogItem extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            dialog: false,
            value: props.value
        };
    }
    
    _open = () => {
        this.setState({dialog: true});
    }
    _close = () => {
        this.setState({dialog: false});
    }
    _submit = () => {
        this.props._submit(this.state.value);
        this._close();
    }
    _key = (e) => {
        this.setState({value: e.target.value});
    }
    
    render() {
        const actions = [
            <FlatButton label='Cancel'
                        onTouchTap={this._close}/>,
            <FlatButton label='Submit'
                        primary={true}
                        onTouchTap={this._submit}/>
        ];

        return (
            <div>
                <ListItem primaryText={this.props.primary}
                          onTouchTap={this._open}
                          rightIcon={this.props.icon}/>
                <Dialog title={this.props.title}
                        actions={actions}
                        modal={false}
                        open={this.state.dialog}
                        onRequestClose={this._close}>
                    <TextField id={this.props.type}
                               value={this.state.value}
                               onChange={this._key}
                               autoFocus/>
                </Dialog>
            </div>
        );
    }
}