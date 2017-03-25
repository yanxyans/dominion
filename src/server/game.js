function Game(io) {
	this.io = io;
	this.rooms = {};
}

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
	var j, x, i;
	for (i = a.length; i; i--) {
		j = Math.floor(Math.random() * i);
		x = a[i - 1];
		a[i - 1] = a[j];
		a[j] = x;
	}
}

// game room management

Game.prototype.newRoom = function(room, set) {
	if (this.rooms[room]) {
		return {
			head: 'err',
			body: 'room is taken'
		};
	}
	
	this.initRoom(room, set);
	return {
		head: 'ok',
		body: 'room was created'
	};
};

Game.prototype.initRoom = function(room, set) {
	this.rooms[room] = {
		set: set,
		users: {},
		players: [],
		phase: 0,
		turn: -1,
		trash: []
	};
};

Game.prototype.addUser = function(user, room) {
	var game = this.rooms[room];
	if (!game) {
		user.emit('_user_room', {
			head: 'err',
			body: 'room does not exist'
		});
	} else if (user.id in game.users) {
		user.emit('_user_room', {
			head: 'err',
			body: 'user in room'
		});
	} else {
		var player_spot = game.players.length;
		var user_type = game.turn === -1 && player_spot < 4 ? 1 : 0;
		game.users[user.id] = {
			name: user.name,
			type: user_type
		};
		
		user.addGame(room, user_type ? player_spot : -1);
		user.enterGame(null, room);
		this.emitRoomUser(room);
		
		if (user_type) {
			var player = {
				spot: player_spot,
				id: user.id,
				name: user.name,
				socket: user.socket,
				deck: [],
				discard: [],
				inPlay: [],
				hand: [],
				resource: {
					action: 0,
					buy: 0,
					coin: 0,
					potion: 0
				}
			};
			
			game.players.push(player);
			// get player resources and action if applicable
			this.emitPlayer(player, room);
		}
		this.emitRoomBoard(room);
	}
};

Game.prototype.removeUser = function(user, room) {
	var game = this.rooms[room];
	if (!game) {
		user.emit('_user_room', {
			head: 'err',
			body: 'room does not exist'
		});
	} else if (!(user.id in game.users)) {
		user.emit('_user_room', {
			head: 'err',
			body: 'user not in room'
		});
	} else {
		var user_type = game.users[user.id].type;
		delete game.users[user.id];
		
		// user empties his view if left room is current room
		user.removeGame(room);
		this.emitRoomUser(room);
		
		if (user_type) {
			if (!game.phase) {
				// remove player
				game.players.splice(user.games[room], 1);
				this.emitRoomBoard(room);
			} else {
				// attempt reconnect
			}
		}
	}
};

Game.prototype.disconnectUser = function(user) {
	Object.keys(user.games).forEach(function(room) {
		this.removeUser(user, room);
	}, this);
};

// game life cycle management

Game.prototype.start = function(player, room) {
	var game = this.rooms[room];
	if (!game || game.players.length < 2) {
		this.emitPlayer(player, room);
	} else if (game.phase) {
		// game already in progress
	} else {
		game.phase = 1;
		game.turn = 0;
		
		// init player resources
		var set = game.set;
		var players = game.players;
		var startCards = Object.keys(set.start);
		for (var i = 0; i < players.length; i++) {
			var gamePlayer = players[i];
			startCards.forEach(function(startCard) {
				var startCardAmt = set.start[startCard];
				this.gain(set.kingdom, gamePlayer.discard, startCard, startCardAmt);
			}, this);
			this.draw(gamePlayer, 5);
			
			this.emitPlayer(gamePlayer, room);
		}
		this.emitRoomBoard(room);
	}
};

Game.prototype.end = function(player, room) {
	console.log("end");
	var game = this.rooms[room];
	this.emitPlayer(player, room);
};

Game.prototype.gain = function(src, dest, card, amt) {
	var pile_amt = src[card];
	var gain_amt = Math.min(amt, pile_amt);
	src[card] -= gain_amt;
	
	for (var i = 0; i < gain_amt; i++) {
		dest.push(card);
	}
};

Game.prototype.draw = function(player, amt) {
	var deck_amt = player.deck.length;
	var draw_amt = Math.min(amt, deck_amt);
	
	for (var i = 0; i < draw_amt; i++) {
		player.hand.push(player.deck.pop());
	}
	if (draw_amt < amt && player.discard) {
		shuffle(player.discard);
		[player.deck, player.discard] = [player.discard, player.deck];
		this.draw(player, amt - draw_amt);
	}
};

// game view management

Game.prototype.emitRoomUser = function(room) {
	var game = this.rooms[room];
	if (game) {
		this.io.in(room).emit('_game_user', game.users);
	}
};

Game.prototype.emitPlayer = function(player, room) {
	if (player &&
			player.id in this.io.sockets.adapter.rooms[room].sockets) {
		player.socket.emit(
			'_game_player', {
				name: player.name,
				deckSize: player.deck.length,
				discard: player.discard,
				inPlay: player.inPlay,
				hand: player.hand,
				resource: player.resource
			},
			...this.getAction(player, room));
	}
};

Game.prototype.getPlayer = function(player) {
	if (player) {
		return {
			name: player.name,
			deckSize: player.deck.length,
			discardTop: player.discard.slice(-1),
			inPlay: player.inPlay,
			handSize: player.hand.length,
			resource: player.resource
		};
	}
};

Game.prototype.emitRoomBoard = function(room) {
	var game = this.rooms[room];
	if (game) {
		var connectedUsers = this.io.sockets.adapter.rooms[room].sockets;
		var board = {
			piles: game.set.kingdom,
			players: game.players.map(this.getPlayer)
		};
		
		Object.keys(connectedUsers).forEach(function(user) {
			// do not emit self to player
			this.io.to(user).emit('_game_board', game.users[user].type ? {
				piles: board.piles,
				players: game.players.filter(function(player) {
					return player.id != user;
				}).map(this.getPlayer)
			} : board);
		}, this);
	}
};

Game.prototype.getAction = function(player, room) {
	var game = this.rooms[room];
	if (game && game.turn === -1 || game.players[game.turn] === player) {
		switch (game.phase) {
			case 0:
				return ["Start Game", this.start.bind(this, player, room)];
			case 1:
				return ["End Turn", this.end.bind(this, player, room)];
			default:
				// do nothing
		}
	}
	return [null, null];
};

Game.prototype.onSuccess = function(user) {
	var inGame = user.inGame;
	var game = this.rooms[inGame];
	var isPlayer = user.games[inGame];
	if (game) {
		user.emit('_game_user', game.users);
		user.emit('_game_board', {
			piles: game.set.kingdom,
			players: game.players.filter(function(player) {
				return player.id != user.id
			}).map(this.getPlayer)
		});
		
		if (isPlayer > -1) {
			this.emitPlayer(game.players[isPlayer], inGame);
		} else {
			user.emit('_game_player', null, null, null);
		}
	}
};

module.exports = Game;