import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MenuComponent from './MenuComponent';
import GameComponent from './GameComponent';

injectTapEventPlugin();

class Container extends React.Component {
	state = {
		name: '',
		rooms: {},
		sel_room: null,
		kingdom: null,
		users: null,
		action_name: null,
		action: null,
		is_player: false
	};
	
	_init = (name) => {
		this.setState({name: name});
	};
	
	_updateName = (msg, name) => {
		if (msg.head === 'ok') {
			this.setState({name: name});
		}
		console.log(msg.body);
	};
	
	_updateView = (msg, view) => {
		if (msg.head === 'ok') {
			this.setState({
				rooms: view.rooms,
				in_room: view.in_room,
				is_player: view.is_player
			});
		}
		console.log(msg.body);
	};
	
	_updateGame = (game) => {
		this.setState({
			kingdom: game.kingdom,
			users: game.users
		});
	};
	
	_updateAction = (action_name, action) => {
		this.setState({
			action_name: action_name,
			action: action
		});
	};
	
	_setName = (name) => {
		this.socket.emit('_set_name', name);
	};
	
	_joinRoom = (room) => {
		this.socket.emit('_join_room', room);
	};
	
	_pickRoom = (room) => {
		this.socket.emit('_pick_room', room);
	};
	
	componentDidMount = () => {
		this.socket = io();
		this.socket.on('_init', this._init);
		this.socket.on('_update_name', this._updateName);
		this.socket.on('_update_view', this._updateView);
		this.socket.on('_update_game', this._updateGame);
		this.socket.on('_update_action', this._updateAction);
	}
	
  render() {
    return (
			<MuiThemeProvider>
				<div id='container'>
					<GameComponent kingdom={this.state.kingdom}
												 users={this.state.users}
												 action_name={this.state.action_name}
												 action={this.state.action}
												 is_player={this.state.is_player} />	
					<MenuComponent name={this.state.name}
												 setName={this._setName}
												 rooms={this.state.rooms}
												 in_room={this.state.in_room}
												 joinRoom={this._joinRoom}
												 pickRoom={this._pickRoom} />
				</div>
			</MuiThemeProvider>
		)
  }
};
 
ReactDOM.render(<Container />, document.getElementById('root'));

if (module.hot) {
	module.hot.accept();
}