import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MenuComponent from './MenuComponent';

injectTapEventPlugin();

class GameComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			rooms: {}
		};
		
		this._init = this._init.bind(this);
		this._updateName = this._updateName.bind(this);
		this._handleSetName = this._handleSetName.bind(this);
		this._updateRooms = this._updateRooms.bind(this);
		this._updateUsers = this._updateUsers.bind(this);
		this._handleJoinRoom = this._handleJoinRoom.bind(this);
	}
	
	componentDidMount() {
		this.socket = io();
		this.socket.on('_init', this._init);
		this.socket.on('_updateName', this._updateName);
		this.socket.on('_updateRooms', this._updateRooms);
		this.socket.on('_updateUsers', this._updateUsers);
	}
	
	_init(name) {
		this.setState({
			name: name
		});
	}
	
	_updateName(name) {
		this.setState({
			name: name
		});
	}
	
	_handleSetName(newName) {
		this.socket.emit('_setName', newName);
	}
	
	_updateRooms(rooms) {
		this.setState({
			rooms: rooms
		});
	}
	
	_updateUsers(room, spectators, players) {
		var rooms = this.state.rooms;
		var r = rooms[room];
		if (r) {
			r.spectators = spectators;
			r.players = players;
			this.setState({
				rooms: rooms
			});
		}
	}
	
	_handleJoinRoom(room, type) {
		this.socket.emit('_joinRoom', room, type);
	}
	
  render() {
    return (
			<MuiThemeProvider>
				<MenuComponent name={this.state.name} setName={this._handleSetName}
											 rooms={this.state.rooms} joinRoom={this._handleJoinRoom} />
			</MuiThemeProvider>
		)
  }
}
 
ReactDOM.render(<GameComponent />, document.getElementById('root'));

if (module.hot) {
	module.hot.accept();
}