import React from 'react';

import { List, ListItem } from 'material-ui/List';
import RoomList from './RoomList';

import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

import NameComponent from './NameComponent';
import JoinComponent from './JoinComponent';

import Drawer from 'material-ui/Drawer';
import RaisedButton from 'material-ui/RaisedButton';

export default class MenuComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    state = {
        open: false
    }
    
    _handleToggle = () => {
        this.setState({open: !this.state.open});
    }
    
    render() {
        return (
            <div>
                <RaisedButton
                    label="Open Menu"
                    onTouchTap={this._handleToggle}
                />
                <Drawer
                    docked={false}
                    open={this.state.open}
                    onRequestChange={(open) => this.setState({open})}
                >
                    <List>
                        <NameComponent name={this.props.name}
                                       _setName={this.props._setName}/>
                        <JoinComponent _joinRoom={this.props._joinRoom}/>
                    </List>
                    
                    <Divider/>
                    <RoomList current={this.props.current}
                              _setRoom={this.props._setRoom}>
                        <Subheader>rooms</Subheader>
                        {Object.keys(this.props.rooms).map(function(room, index) {
                            var room = this[index];
                            return <ListItem key={index}
                                             primaryText={room}/>;
                        }, this.props.rooms)}
                    </RoomList>
                    
                    <Divider/>
                    <List>
                        <Subheader>users</Subheader>
                        {Object.keys(this.props.users).map(function(user, index) {
                            var user = this[index];
                            return <ListItem key={index}
                                             primaryText={user.name}
                                             secondaryText={user.type}/>;
                        }, this.props.users)}
                    </List>
                    
                </Drawer>
            </div>
        );
    }
}