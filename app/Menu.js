import React from 'react';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import { List, ListItem } from 'material-ui/List';

import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import { cyan700 } from 'material-ui/styles/colors';

import IconButton from 'material-ui/IconButton';
import IconIn from 'material-ui/svg-icons/action/zoom-in';
import IconOut from 'material-ui/svg-icons/action/zoom-out';
import IconEdit from 'material-ui/svg-icons/image/edit';
import IconDice from 'material-ui/svg-icons/places/casino';

import DialogItem from './DialogItem';
import RoomList from './RoomList';

export default class Menu extends React.Component {
    state = {
        drawer: false
    }
    
    _drawer = () => {
        this.setState({drawer: !this.state.drawer});
    }
    
    render() {
        var props = this.props;
        return (
            <div id='menu'>
                <AppBar title='menu'
                        onLeftIconButtonTouchTap={this._drawer}
                        iconElementRight={props.tooltip ?
                            <IconButton tooltip='tooltip on'><IconIn/></IconButton> :
                            <IconButton tooltip='tooltip off'><IconOut/></IconButton>}
                        onRightIconButtonTouchTap={props._tooltip}
                        style={{zIndex:998}}/>
                <Drawer docked={false}
                        open={this.state.drawer}
                        onRequestChange={(drawer) => this.setState({drawer})}>
                    <List>
                        <DialogItem primary={props.name}
                                    icon={<IconEdit color={cyan700}/>}
                                    title='enter new name'
                                    type='name'
                                    value=''
                                    _submit={props._rename}/>
                        <DialogItem primary='join room'
                                    icon={<IconDice color={cyan700}/>}
                                    title='enter room name'
                                    type='room'
                                    value='first game'
                                    _submit={props._add}/>
                    </List>
                    
                    <Divider/>
                    <RoomList current={props.current} _join={props._join}>
                        <Subheader> rooms </Subheader>
                        {Object.keys(props.rooms).map(function(name, index) {
                            return <ListItem key={index} primaryText={name} value={name}/>;
                        })}
                    </RoomList>
                    
                    <Divider/>
                    <List>
                        <Subheader> users </Subheader>
                        {props.users.map(function(user, index) {
                            return <ListItem key={index}
                                             primaryText={user.name}
                                             rightIcon={user.type === 'player' ?
                                                <IconDice color={cyan700}/> : <IconDice/>}
                                             disabled={true}/>;
                        })}
                    </List>
                    
                </Drawer>
            </div>
        );
    }
}