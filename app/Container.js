import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MenuComponent from './MenuComponent';
import GameComponent from './GameComponent';

injectTapEventPlugin();

function getNumber(theNumber)
{
    if(theNumber > 0){
        return "+" + theNumber;
    }else{
        return theNumber.toString();
    }
}

class Container extends React.Component {
	state = {
		socket: null,
		name: '',
		rooms: [],
		current: null,
		users: [],
		players: [],
		piles: {},
		trash: []
	};
	
	_init = (name) => {
		this.setState({name: name});
	};
	_updateUserState = (userState) => {
		if (userState) {
			this.setState({
				name: userState.name,
				rooms: userState.rooms,
				current: userState.current
			});
		}
	};
	_updateRoomState = (roomState) => {
		if (roomState) {
			this.setState({
				users: roomState.users,
				players: roomState.players,
				piles: roomState.piles,
				trash: roomState.trash
			});
		}
	}
	
	_setName = (name) => {
		this.socket.emit('_set_name', name);
	};
	_joinRoom = (name) => {
		this.socket.emit('_join_room', name);
	};
	_setRoom = (name) => {
		this.socket.emit('_set_room', name);
	};
	
	_reconnectRoom = (slot) => {
		this.socket.emit('_recon_room', slot);
	};
	_sendControl = (control) => {
		this.socket.emit('_send_control', control);
	};
	_tapCard = (src, index) => {
		this.socket.emit('_tap_card', src, index);
	};
	_endState = (data) => {
		console.log(data);
	};
	
	componentDidMount = () => {
		this.socket = io();
		this.socket.on('_init', this._init);
		this.socket.on('_user_state', this._updateUserState);		
		this.socket.on('_room_state', this._updateRoomState);
		this.socket.on('_end_state', this._endState);
	}
	
  render() {
    return (
			<MuiThemeProvider>
				<div id='container'>
					<MenuComponent name={this.state.name}
												 _setName={this._setName}
												 rooms={this.state.rooms}
												 current={this.state.current}
												 _joinRoom={this._joinRoom}
												 _setRoom={this._setRoom} />
					<GameComponent users={this.state.users}
												 players={this.state.players}
												 piles={this.state.piles}
												 trash={this.state.trash}
												 _sendControl={this._sendControl}
												 _reconnectRoom={this._reconnectRoom}
												 _tapCard={this._tapCard} />
				</div>
			</MuiThemeProvider>
		)
  }
};
 
ReactDOM.render(<Container />, document.getElementById('root'));