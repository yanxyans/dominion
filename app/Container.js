import React from 'react';
import ReactDOM from 'react-dom';

import injectTapEventPlugin from 'react-tap-event-plugin';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import MenuComponent from './MenuComponent';
import GameComponent from './GameComponent';

import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';

injectTapEventPlugin();

const socket = io();

class Container extends React.Component {
    constructor(props) {
        super(props);
        
        socket.on('_init', this._init);
        socket.on('_user_state', this._updateUserState);        
        socket.on('_room_state', this._updateRoomState);
        socket.on('_react_message', this._reactMessage);
        
        this._joinRoom('first game');
        this._sendControl('Start');
    }
    state = {
        name: '',
        rooms: [],
        current: null,
        users: [],
        players: [],
        piles: {},
        trash: null,
        help: true,
        gameState: null,
        messageOpen: false,
        messageContent: ''
    }
    
    _reactMessage = (msg) => {
        this.setState({messageOpen: true, messageContent: msg});
    }
    
    _init = (name) => {
        this.setState({name: name});
    }
    _updateUserState = (userState) => {
        if (userState) {
            this.setState({
                name: userState.name,
                rooms: userState.rooms,
                current: userState.current
            });
        }
    }
    _updateRoomState = (roomState) => {
        if (roomState) {
            this.setState({
                users: roomState.users,
                players: roomState.players,
                piles: roomState.piles,
                trash: roomState.trash,
                gameState: roomState.state
            });
        }
    }
    
    _setName = (name) => {
        socket.emit('_set_name', name);
    }
    _joinRoom = (name) => {
        socket.emit('_join_room', name);
    }
    _setRoom = (name) => {
        socket.emit('_set_room', name);
    }
    
    _reconRoom = (slot) => {
        socket.emit('_recon_room', slot);
    }
    _sendControl = (control) => {
        socket.emit('_send_control', control);
    }
    _tapCard = (src, index) => {
        socket.emit('_tap_card', src, index);
    }
    _toggleHelp = () => {
        this.setState({help: !this.state.help});
    }
    
    handleRequestClose = () => {
        this.setState({
            messageOpen: false,
            messageContent: ''
        });
    }
    
    render() {
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <div id='container'>
                    <MenuComponent name={this.state.name}
                                   rooms={this.state.rooms}
                                   current={this.state.current}
                                   users={this.state.users}
                                   _setName={this._setName}
                                   _joinRoom={this._joinRoom}
                                   _setRoom={this._setRoom}
                                   _toggleHelp={this._toggleHelp}
                                   help={this.state.help}/>
                    {this.state.gameState &&
                    <GameComponent players={this.state.players}
                                   piles={this.state.piles}
                                   trash={this.state.trash}
                                   help={this.state.help}
                                   gameState={this.state.gameState}
                                   _reconRoom={this._reconRoom}
                                   _sendControl={this._sendControl}
                                   _tapCard={this._tapCard}/>}
                    <Snackbar open={this.state.messageOpen}
                              message={this.state.messageContent}
                              autoHideDuration={4000}
                              onRequestClose={this.handleRequestClose}
                              action='Ok'
                              onActionTouchTap={this.handleRequestClose}/>
                </div>
            </MuiThemeProvider>
        );
    }
}
 
ReactDOM.render(
    <Container/>,
    document.getElementById('root')
)