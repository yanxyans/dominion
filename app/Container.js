import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import { darkWhite } from 'material-ui/styles/colors';

import Snackbar from 'material-ui/Snackbar';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';

import Menu from './Menu';
import Game from './Game';
import FullWidthSection from './FullWidthSection';

injectTapEventPlugin();
const socket = io();

const styles = {
    footer: {
        textAlign: 'center'
    },
    iconButton: {
        color: darkWhite
    }
};

class Container extends React.Component {
    constructor(props) {
        super(props);
        
        socket.on('_init', this._init);
        socket.on('_user_state', this._user);        
        socket.on('_room_state', this._room);
        socket.on('_reaction_event', this._react);
    }
    state = {
        name: '',
        rooms: [],
        current: '',
        users: [],
        players: [],
        supply: {},
        trash: null,
        snack: false,
        bar: '',
        tooltip: true
    }
    
    _init = (name) => {
        this.setState({name: name});
    }
    _user = (user) => {
        this.setState({
            name: user.name,
            rooms: user.rooms,
            current: user.current
        });
    }
    _room = (room) => {
        this.setState({
            users: room.users,
            players: room.players,
            supply: room.supply,
            trash: room.trash
        });
    }
    _react = (message) => {
        this.setState({
            snack: true,
            bar: message
        });
    }
    _timeout = () => {
        this.setState({
            snack: false,
            bar: ''
        });
    }
    _tooltip = () => {
        this.setState({tooltip: !this.state.tooltip});
    }
    
    _rename = (name) => {
        socket.emit('_set_name', name);
    }
    _add = (room) => {
        socket.emit('_join_room', room);
    }
    _join = (room) => {
        socket.emit('_set_room', room);
    }
    
    _recon = (slot) => {
        socket.emit('_recon_room', slot);
    }
    _complete = (control) => {
        socket.emit('_send_control', control);
    }
    _tap = (src, index) => {
        socket.emit('_tap_card', src, index);
    }
    
    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <Paper id='container'>
                    <Menu name={this.state.name}
                          rooms={this.state.rooms}
                          current={this.state.current}
                          users={this.state.users}
                          tooltip={this.state.tooltip}
                          _rename={this._rename}
                          _add={this._add}
                          _join={this._join}
                          _tooltip={this._tooltip}/>
                    <Game isPlayer={this.state.rooms[this.state.current]}
                          players={this.state.players}
                          supply={this.state.supply}
                          trash={this.state.trash}
                          tooltip={this.state.tooltip}
                          _recon={this._recon}
                          _complete={this._complete}
                          _tap={this._tap}/>
                    <FullWidthSection style={styles.footer}>
                        <IconButton
                            iconStyle={styles.iconButton}
                            iconClassName="muidocs-icon-custom-github"
                            href="https://github.com/yanxyans/dominion"
                        />
                    </FullWidthSection>
                    <Snackbar open={this.state.snack}
                              message={this.state.bar}
                              autoHideDuration={4000}
                              onRequestClose={this._timeout}
                              action='ok'
                              onActionTouchTap={this._timeout}/>
                </Paper>
            </MuiThemeProvider>
        );
    }
}
 
ReactDOM.render(
    <Container/>,
    document.getElementById('root')
);