import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MenuComponent from './MenuComponent';

injectTapEventPlugin();

class GameComponent extends React.Component {
	state = {
		name: '',
		rooms: {},
		sel_room: null
	};
	
	componentDidMount = () => {
		this.socket = io();
		this.socket.on('_init', this._init);
		this.socket.on('_update_name', this._updateName);
		this.socket.on('_update_rooms', this._updateRooms);
	};
	
	_init = (name) => {
		this.setState({name: name});
	};
	
	_updateName = (name) => {
		this.setState({name: name});
	};
	
	_updateRooms = (rooms) => {
		this.setState({rooms: rooms.rooms, sel_room: rooms.sel});
	};
	
	_setName = (name) => {
		this.socket.emit('_set_name', name);
	};
	
	_joinRoom = (room) => {
		this.socket.emit('_join_room', room);
	};
	
  render() {
    return (
			<MuiThemeProvider>
				<MenuComponent name={this.state.name} setName={this._setName}
											 rooms={this.state.rooms} sel_room={this.state.sel_room}
											 joinRoom={this._joinRoom} />
			</MuiThemeProvider>
		)
  }
}
 
ReactDOM.render(<GameComponent />, document.getElementById('root'));

if (module.hot) {
	module.hot.accept();
}