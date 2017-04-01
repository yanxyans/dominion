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

function getCoin(card) {
	switch (card) {
		case 'copper':
			return 0;
		case 'silver':
			return 3;
		case 'gold':
			return 6;
		case 'estate':
			return 2;
		case 'duchy':
			return 5;
		case 'province':
			return 8;
		case 'curse':
			return 0;
		default:
			return 0;
	}
}

function getPotion(card) {
	switch (card) {
		case 'copper':
			return 0;
		case 'silver':
			return 0;
		case 'gold':
			return 0;
		case 'estate':
			return 0;
		case 'duchy':
			return 0;
		case 'province':
			return 0;
		case 'curse':
			return 0;
		default:
			return 0;
	}
}

function getType(card) {
	switch (card) {
		case 'copper':
			return ['treasure'];
		case 'silver':
			return ['treasure'];
		case 'gold':
			return ['treasure'];
		case 'estate':
			return ['victory'];
		case 'duchy':
			return ['victory'];
		case 'province':
			return ['victory'];
		case 'curse':
			return ['curse'];
		case 'cellar':
			return ['action'];
		case 'market':
			return ['action'];
		case 'mine':
			return ['action'];
		case 'militia':
			return ['action', 'attack'];
		case 'moat':
			return ['action', 'reaction'];
		case 'remodel':
			return ['action'];
		case 'smithy':
			return ['action'];
		case 'village':
			return ['action'];
		case 'woodcutter':
			return ['action'];
		case 'workshop':
			return ['action'];
		default:
			return null;
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
	
	this.rooms[room] = {
		originSet: set,
		users: {},
		players: [null, null, null, null],
		spots: [3,2, 1, 0]
	};
	this.initRoom(room);
	return {
		head: 'ok',
		body: 'room was created'
	};
};

Game.prototype.initRoom = function(room) {
	var game = this.rooms[room];
	if (game) {
		game.set = {
			start: {},
			kingdom: {}
		};
		Object.keys(game.originSet.start).forEach(function(key) {
			game.set.start[key] = game.originSet.start[key];
		});
		Object.keys(game.originSet.kingdom).forEach(function(key) {
			game.set.kingdom[key] = game.originSet.kingdom[key];
		});
		game.phase = 0;
		game.turn = -1;
		game.trash = [];
	}
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
		var playerSpot = !game.phase && game.spots.length > 0 ? game.spots.pop() : -1;
		// 0 for spectator, 1 for player
		var userType = playerSpot === -1 ? 0 : 1;
		game.users[user.id] = {
			name: user.name,
			type: userType
		};
		
		user.addGame(room, playerSpot);
		user.enterGame(room);
		this.emitRoomUser(room);
		
		if (userType) {
			var player = {
				spot: playerSpot,
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
			
			game.players[playerSpot] = player;
			// get player resources and action if applicable
			this.emitPlayer(player, room);
			this.emitRoomBoard(room);
		} else {
			// get board state
			user.emit('_game_board', {
				piles: game.set.kingdom,
				players: game.players.filter(function(player) {
					return player !== null;
				}).map(this.getPlayer)
			});
		}
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
		var userType = game.users[user.id].type;
		delete game.users[user.id];
		
		// user empties his view if left room is current room
		var playerSpot = user.games[room];
		user.removeGame(room);
		this.emitRoomUser(room);
		
		if (userType) {
			if (!game.phase) {
				// remove player
				game.players[playerSpot] = null;
				game.spots.push(playerSpot);
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

Game.prototype.enterUser = function(user, room) {
	var game = this.rooms[room];
	if (game) {
		var res = user.enterGame(room);
		if (res) {
			user.emit('_game_user', game.users);
			user.emit('_game_board', {
				piles: game.set.kingdom,
				players: game.players.filter(function(player) {
					return player && player.id !== user.id;
				}).map(this.getPlayer)
			});
			
			var isPlayer = user.games[room];
			if (isPlayer !== -1) {
				this.emitPlayer(game.players[isPlayer], room);
			}
		}
	}
};

// game life cycle management

Game.prototype.start = function(player, room) {
	var game = this.rooms[room];
	if (!game || game.spots.length > 2) {
		this.emitPlayer(player, room);
	} else if (game.phase) {
		// game already in progress
	} else {
		game.phase = 1;
		
		// init player resources
		var set = game.set;
		var players = game.players.filter(function(player) {
			return player !== null;
		});
		players[0].resource.action = 1;
		players[0].resource.buy = 1;
		game.turn = players[0].spot;
		
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
	var game = this.rooms[room];
	if (game && game.phase >= 1 && game.phase <= 3) {
		player.resource.action = 0;
		player.resource.buy = 0;
		player.resource.coin = 0;
		player.resource.potion = 0;
		this.cleanUp(player);
		this.draw(player, 5);
		
		game.turn = (game.turn + 1) % 4;
		while (game.players[game.turn] === null) {
			game.turn = (game.turn + 1) % 4;
		}
		game.phase = 1;

		game.players[game.turn].resource.action = 1;
		game.players[game.turn].resource.buy = 1;
		
		this.emitRoomBoard(room);
		this.emitPlayer(game.players[game.turn], room);
	}
	this.emitPlayer(player, room);
};

Game.prototype.cleanUp = function(player) {
	var hand_amt = player.hand.length;
	var inPlay_amt = player.inPlay.length;
	for (var i = 0; i < hand_amt; i++) {
		player.discard.push(player.hand.pop());
	}
	for (var i = 0; i < inPlay_amt; i++) {
		player.discard.push(player.inPlay.pop());
	}
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

Game.prototype.clickCard = function(user, type, card) {
	console.log("clicked card " + card + " of type " + type);
	switch (type) {
		case 'discard':
			this.handleDiscard(user, card);
			break;
		case 'in_play':
			this.handleInPlay(user, card);
			break;
		case 'in_hand':
			this.handleInHand(user, card);
			break;
		case 'buy':
			this.handleBuy(user, card);
			break;
		default:
			// do nothing
	}
};

Game.prototype.handleDiscard = function(user, card) {
	// handle discard click
};

Game.prototype.handleInPlay = function(user, card) {
	// handle in_play click
};

Game.prototype.doAction = function(game, card, cardName) {
	switch (cardName) {
		case 'cellar':
			// do cellar
			break;
		default:
			// do nothing
	}
};

Game.prototype.doTreasure = function(room, card, cardName) {
	var game = this.rooms[room];
	if (game) {
		var player = game.players[game.turn];
		switch (cardName) {
			case 'copper':
				game.phase = 2;
				
				// move card to play field
				player.inPlay.push(player.hand.splice(card, 1)[0]);
				
				// apply it
				player.resource.coin++;
				this.emitPlayer(player, room);
				this.emitRoomBoard(room);
				break;
			case 'silver':
				game.phase = 2;
				
				// move card to play field
				player.inPlay.push(player.hand.splice(card, 1)[0]);
				
				// apply it
				player.resource.coin += 2;
				this.emitPlayer(player, room);
				this.emitRoomBoard(room);
				break;
			case 'gold':
				game.phase = 2;
				
				// move card to play field
				player.inPlay.push(player.hand.splice(card, 1)[0]);
				
				// apply it
				player.resource.coin += 3;
				this.emitPlayer(player, room);
				this.emitRoomBoard(room);
				break;
			default:
				// do nothing
		}
	}
};

Game.prototype.playCard = function(room, card, cardName, possible) {
	var game = this.rooms[room];
	if (game) {
		if (possible.includes('action') && possible.includes('treasure')) {
			// crown card
		} else if (possible.includes('action')) {
			this.doAction(room, card, cardName);
		} else if (possible.includes('treasure')) {
			this.doTreasure(room, card, cardName);
		}
	}
};

Game.prototype.handleInHand = function(user, card) {
	var room = user.inGame;
	var game = this.rooms[room];
	if (game && game.phase) {
		var player = game.players[game.turn];
		if (player.id === user.id && card in player.hand) {
			var cardName = player.hand[card];
			var type = getType(cardName);
			if (type) {
				if (game.phase >= 1 && game.phase <= 2) {
					var phase = game.phase === 1 ? ['action', 'treasure'] : ['treasure'];
					var possiblePlays = phase.filter(function(n) {
						return type.indexOf(n) !== -1;
					});
					this.playCard(room, card, cardName, possiblePlays);
				}
			}
		}
	}
};

Game.prototype.handleBuy = function(user, card) {
	var room = user.inGame;
	var game = this.rooms[room];
	if (game && game.phase) {
		var player = game.players[game.turn];
		var kingdom = game.set.kingdom;
		if (player.id === user.id && kingdom[card]) {
			if (game.phase >= 1 && game.phase <= 3) {
				var coin = getCoin(card);
				var potion = getPotion(card);
				if ((coin <= player.resource.coin) &&
						(potion <= player.resource.potion) &&
						player.resource.buy) {
					game.phase = 3;
					
					player.resource.coin -= coin;
					player.resource.potion -= potion;
					player.resource.buy--;
					
					this.gain(kingdom, player.discard, card, 1);
					this.emitPlayer(player, room);
					this.emitRoomBoard(room);
				}
			} else if (game.phase === 6) {
				// select buy card
			}
		}
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
	var socketRoom = this.io.sockets.adapter.rooms[room];
	if (player &&
			socketRoom &&
			player.id in socketRoom.sockets) {
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
	var socketRoom = this.io.sockets.adapter.rooms[room];
	if (game && socketRoom) {
		var connectedUsers = socketRoom.sockets;

		Object.keys(connectedUsers).forEach(function(user) {
			// do not emit self to player
			this.io.to(user).emit('_game_board', {
				piles: game.set.kingdom,
				players: game.players.filter(function(player) {
					return player && player.id !== user;
				}).map(this.getPlayer)
			});
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
			case 2:
				return ["End Turn", this.end.bind(this, player, room)];
			case 3:
				return ["End Turn", this.end.bind(this, player, room)];
			case 4:
				return ["Apply Action", this.applyAction];
			default:
				// do nothing
		}
	}
	return [null, null];
};

module.exports = Game;