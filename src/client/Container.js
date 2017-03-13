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
		start: {},
		kingdom: {},
		users: {}
	};
	
	_init = (name) => {
		this.setState({name: name});
	};
	
	_updateName = (name) => {
		this.setState({name: name});
	};
	
	_updateView = (view) => {
		this.setState({rooms: view.rooms, sel_room: view.sel_room});
	};
	
	_updateGame = (game) => {
		this.setState({
			start: game.start,
			kingdom: game.kingdom,
			users: game.users
		});
	};
	
	_setName = (name) => {
		this.socket.emit('_set_name', name);
	};
	
	_joinRoom = (room) => {
		this.socket.emit('_join_room', room);
	};
	
	componentDidMount = () => {
		this.socket = io();
		this.socket.on('_init', this._init);
		this.socket.on('_update_name', this._updateName);
		this.socket.on('_update_view', this._updateView);
		this.socket.on('_update_game', this._updateGame);
	}
	
  render() {
    return (
			<MuiThemeProvider>
				<div id='container'>
					<GameComponent start={this.state.start} kingdom={this.state.kingdom} users={this.state.users} />	
					<MenuComponent name={this.state.name} setName={this._setName}
												 rooms={this.state.rooms} sel_room={this.state.sel_room}
												 joinRoom={this._joinRoom} />
				</div>
			</MuiThemeProvider>
		)
  }
};
 
ReactDOM.render(<Container />, document.getElementById('root'));

if (module.hot) {
	module.hot.accept();
}