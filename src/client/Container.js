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
		inRoom: null,
		users: {},
		player: null,
		actionName: null,
		action: null,
		piles: [],
		players: []
	};
	
	_init = (name) => {
		this.setState({name: name});
	};
	
	_name = (msg, name) => {
		if (msg.head === 'ok') {
			this.setState({name: name});
		}
		console.log(msg.body);
	};
	
	_room = (msg, room) => {
		if (msg.head === 'ok') {
			this.setState({
				rooms: room.rooms,
				inRoom: room.inRoom
			});
		}
		console.log(msg.body);
	};
	
	_user = (users) => {
		this.setState({users: users});
	};
	
	_player = (player, actionName, action) => {
		this.setState({
			player: player,
			actionName: actionName,
			action: action
		});
	};
	
	_board = (board) => {
		this.setState({
			piles: board.piles,
			players: board.players
		});
	};
	
	_setName = (name) => {
		this.socket.emit('_set_name', name);
	};
	
	_joinGame = (game) => {
		this.socket.emit('_join_game', game);
	};
	
	_enterGame = (game) => {
		this.socket.emit('_enter_game', game);
	};
	
	_clickCard = (clickKey, cardKey) => {
		this.socket.emit('_click_card', clickKey, cardKey);
	};
	
	componentDidMount = () => {
		this.socket = io();
		this.socket.on('_init', this._init);
		this.socket.on('_user_name', this._name);
		this.socket.on('_user_room', this._room);
		this.socket.on('_game_user', this._user);
		this.socket.on('_game_player', this._player);
		this.socket.on('_game_board', this._board);
		
		this._joinGame('dominion0');
	}
	
  render() {
    return (
			<MuiThemeProvider>
				<div id='container'>
					<GameComponent users={this.state.users}
												 player={this.state.player}
												 actionName={this.state.actionName}
												 action={this.state.action}
												 piles={this.state.piles}
												 players={this.state.players}
												 _clickCard={this._clickCard} />
					<MenuComponent name={this.state.name}
												 _setName={this._setName}
												 rooms={this.state.rooms}
												 inRoom={this.state.inRoom}
												 _joinGame={this._joinGame}
												 _enterGame={this._enterGame} />
				</div>
			</MuiThemeProvider>
		)
  }
};
 
ReactDOM.render(<Container />, document.getElementById('root'));

if (module.hot) {
	module.hot.accept();
}