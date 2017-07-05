import React from 'react';

import { List, ListItem } from 'material-ui/List';
import RoomList from './RoomList';

import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

import NameComponent from './NameComponent';
import JoinComponent from './JoinComponent';

import Drawer from 'material-ui/Drawer';

import IconButton from 'material-ui/IconButton';
import ActionMenu from 'material-ui/svg-icons/navigation/menu';

import AppBar from 'material-ui/AppBar';

import { amberA700 } from 'material-ui/styles/colors';

import IconPublic from 'material-ui/svg-icons/social/public';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import FontIcon from 'material-ui/FontIcon';

import IconBooks from 'material-ui/svg-icons/av/library-books';
import IconEmail from 'material-ui/svg-icons/communication/email';
import IconMenu from 'material-ui/svg-icons/navigation/menu';

const styles = {
    appBar: {
        backgroundColor: amberA700
    },
    appBarIcons: {
        backgroundColor: '#303030'
    }
};

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
            <div id='menu'>
                <Toolbar style={styles.appBar}>
                    <ToolbarGroup>
                        <IconButton tooltip='menu'
                                    onTouchTap={this._handleToggle}>
                            <IconMenu/>
                        </IconButton>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        <IconButton tooltip='source'
                                    onTouchTap={() => window.open('https://github.com/yanxyans/dominion')}>
                            <FontIcon className='muidocs-icon-custom-github'/>
                        </IconButton>
                        <IconButton tooltip='official'
                                    onTouchTap={() => window.open('https://dominion.games')}>
                            <IconPublic/>
                        </IconButton>
                        <IconButton tooltip='wiki'
                                    onTouchTap={() => window.open('http://wiki.dominionstrategy.com/index.php/Gameplay')}>
                            <IconBooks/>
                        </IconButton>
                        <IconButton tooltip='contact'
                                    href='mailto:fssyan@gmail.com'>
                            <IconEmail/>
                        </IconButton>
                    </ToolbarGroup>
                </Toolbar>
                <Drawer
                    docked={false}
                    open={this.state.open}
                    onRequestChange={(open) => this.setState({open})}
                >
                    <List>
                        <NameComponent name={this.props.name}
                                       _setName={this.props._setName}/>
                        <JoinComponent _joinRoom={this.props._joinRoom}/>
                        <ListItem primaryText='toggle magnify' onTouchTap={this.props._toggleHelp}/>
                    </List>
                    
                    <Divider/>
                    <RoomList current={this.props.current}
                              _setRoom={this.props._setRoom}>
                        <Subheader>rooms</Subheader>
                        {Object.keys(this.props.rooms).map(function(room, index) {
                            var room = this[index];
                            return <ListItem key={index}
                                             primaryText={room}
                                             value={room}/>;
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