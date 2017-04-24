import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MenuComponent from './MenuComponent';
import GameComponent from './GameComponent';
import Snackbar from 'material-ui/Snackbar';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import Chip from 'material-ui/Chip';

injectTapEventPlugin();

function getNumber(theNumber)
{
    if(theNumber > 0){
        return "+" + theNumber;
    }else{
        return theNumber.toString();
    }
}

const styles = {
  chip: {
    margin: 4,
  }
};

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
		players: [],
		trash: [],
		msg: "",
		open: false,
		finalScore: [],
		openScore: false,
		help: ''
	};
	
	getColor = (types) => {
		if (types.includes('attack')) {
			return '#B85B80';
		} else if (types.includes('reaction')) {
			return '#7BBCCD';
		} else if (types.includes('treasure')) {
			return '#F0C060';
		} else if (types.includes('victory')) {
			return '#19828B';
		} else if (types.includes('curse')) {
			return '#915996';
		} else {
			return null;
		}
	};
	
	handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };
	
	handleCloseScore = () => {
    this.setState({
      openScore: false,
    });
  };
	
	handleRowSelection = (rowIds) => {
		var newFinalScore = this.state.finalScore.map(function(score, idx) {
			score.show = rowIds.includes(idx);
			return score;
		});
		this.setState({finalScore: newFinalScore});
	};
	
	_init = (name) => {
		this.setState({name: name});
	};
	
	_name = (msg, name) => {
		if (msg.head === 'ok') {
			this.setState({name: name});
		}
		this.setState({msg: msg.body, open: true});
	};
	
	_room = (msg, room) => {
		if (msg.head === 'ok') {
			this.setState({
				rooms: room.rooms,
				inRoom: room.inRoom
			});
		}
		this.setState({msg: msg.body, open: true});
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
			players: board.players,
			trash: board.trash
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
	
	_rec = (spot) => {
		this.socket.emit('_reconnect', spot);
	};
	
	_reaction = (msg) => {
		this.setState({msg: msg, open: true});
	};
	
	_end_score = (endScores) => {
		this.setState({finalScore: endScores, openScore: true});
	};
	
	_help = (card_name) => {
		if (card_name === '') {
			this.setState({help: ''});
		} else {
			this.setState({help: '/asset/cards/' + card_name + '.jpg'});
		}
	};
	
	componentDidMount = () => {
		this.socket = io();
		this.socket.on('_init', this._init);
		this.socket.on('_user_name', this._name);
		this.socket.on('_user_room', this._room);
		this.socket.on('_game_user', this._user);
		this.socket.on('_game_player', this._player);
		this.socket.on('_game_board', this._board);
		this.socket.on('_reaction', this._reaction);
		this.socket.on('_end_score', this._end_score);
	}
	
  render() {
		const actions = [
      <FlatButton
        label="Finish"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleCloseScore}
      />
    ];
		
    return (
			<MuiThemeProvider>
				<div id='container'>
					<MenuComponent name={this.state.name}
												 _setName={this._setName}
												 rooms={this.state.rooms}
												 inRoom={this.state.inRoom}
												 _joinGame={this._joinGame}
												 _enterGame={this._enterGame}
												 helpCard={this.state.help} />
					<GameComponent users={this.state.users}
												 player={this.state.player}
												 actionName={this.state.actionName}
												 action={this.state.action}
												 piles={this.state.piles}
												 players={this.state.players}
												 _clickCard={this._clickCard}
												 _rec={this._rec}
												 trash={this.state.trash}
												 _help={this._help} />
					<Snackbar open={this.state.open}
										message={this.state.msg}
										autoHideDuration={4000}
										onRequestClose={this.handleRequestClose} />
					<Dialog
						title="final game score"
						actions={actions}
						modal={true}
						open={this.state.openScore}
						onRequestClose={this.handleCloseScore}>
						<Table multiSelectable={true} onRowSelection={this.handleRowSelection}>
							<TableHeader displaySelectAll={false}>
								<TableRow selectable={false}>
									<TableHeaderColumn>name</TableHeaderColumn>
									<TableHeaderColumn>score</TableHeaderColumn>
								</TableRow>
							</TableHeader>
							<TableBody>
								{this.state.finalScore.map(function(score, index) {
									return <TableRow key={index}>
													 <TableRowColumn>{score.name}</TableRowColumn>
													 <TableRowColumn>{!score.show ? score.score : Object.keys(score.cards).map(function(ca) {
														 var card = score.cards[ca];
														 return <Chip style={styles.chip} backgroundColor={this.getColor(card.types)}>{ca + " (" + card.amt + ") (" + getNumber(card.points) + ")"}</Chip>;
													 }, this)}</TableRowColumn>
												 </TableRow>;
								}, this)}
							</TableBody>
						</Table>
					</Dialog>
				</div>
			</MuiThemeProvider>
		)
  }
};
 
ReactDOM.render(<Container />, document.getElementById('root'));