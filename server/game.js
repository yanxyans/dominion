var Player = require('./player');
var getCard = require('./card');

function Game(io) {
	this.io = io;
	this.rooms = {};
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
		game.state = "init";
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
		var playerSpot = game.state === "init" && game.spots.length > 0 ? game.spots.pop() : -1;
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
			var player = new Player(user, playerSpot);
			game.players[playerSpot] = player;
			this.emitPlayer(player, room);
		} else {
			user.emit('_game_player');
		}
		this.emitBoard(userType ? null : user, room);
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
			if (game.state === "init") {
				// remove player
				game.players[playerSpot] = null;
				game.spots.push(playerSpot);
			} else {
				// attempt reconnect
				game.players[playerSpot].id = null;
				game.players[playerSpot].name = 'disc';
				game.players[playerSpot].socket = null;
				game.players[playerSpot].seated = false;
			}
			this.emitBoard(null, room);
		}
	}
};

Game.prototype.reconnect = function(user, spot) {
	var room = user.inGame;
	var game = this.rooms[room];
	if (game && game.players[spot] && !game.players[spot].seated && (user.games[room] < 0)) {
		game.players[spot].id = user.id;
		game.players[spot].name = user.name;
		game.players[spot].socket = user.socket;
		game.players[spot].seated = true;
		
		game.users[user.id].type = 1;
		user.games[room] = spot;
		
		this.emitPlayer(game.players[spot], room);
		this.emitBoard(null, room);
		this.emitRoomUser(room);
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
			
			this.emitBoard(user, room);
			
			var isPlayer = user.games[room];
			if (isPlayer !== -1) {
				this.emitPlayer(game.players[isPlayer], room);
			} else {
				user.emit('_game_player');
			}
		}
	}
};

// game life cycle management

Game.prototype.start = function(player, room) {
	var game = this.rooms[room];
	if (!game || game.spots.length > 2) {
		this.emitPlayer(player, room);
	} else if (game.state !== "init") {
		// game already in progress
	} else {
		game.state = "in_progress";
		
		var players = game.players.filter(function(player) {
			return player !== null;
		});
		
		// init board
		Object.keys(game.originSet.start).forEach(function(key) {
			game.set.start[key] = game.originSet.start[key];
		});
		Object.keys(game.originSet.kingdom).forEach(function(pileName) {
			var pile_amt = this.originSet.kingdom[pileName][4 - this.spots.length - 2];
			
			this.set.kingdom[pileName] = [];
			for (var i = 0; i < pile_amt; i++) {
				this.set.kingdom[pileName].push(getCard(pileName));
			}
		}, game);
		
		// init player resources
		var set = game.set;
		
		game.turn = players[0].spot;
		
		var startCards = Object.keys(set.start);
		for (var i = 0; i < players.length; i++) {
			var gamePlayer = players[i];
			gamePlayer.deck = [];
			gamePlayer.discard = [];
			gamePlayer.hand = [];
			gamePlayer.inPlay = [];
			gamePlayer.resource = {
				action: i ? 0 : 1,
				buy: i ? 0 : 1,
				coin: 0,
				potion: 0
			};
			gamePlayer.todo = [];
			gamePlayer.attack = null;
			gamePlayer.reaction = [];
			
			startCards.forEach(function(startCard) {
				var startCardAmt = set.start[startCard];
				gamePlayer.gain(set.kingdom, 'discard', startCard, startCardAmt);
			}, this);
			gamePlayer.draw(5);
			gamePlayer.phase = i ? 0 : 1;
			
			gamePlayer.next = players[(i + 1) % players.length].spot;
			this.emitPlayer(gamePlayer, room);
		}

		this.emitBoard(null, room);
	}
};

Game.prototype.end = function(player, room) {
	var game = this.rooms[room];
	if (game && game.state === "in_progress" && player.phase >= 1 && player.phase <= 3) {
		var zeroPiles = Object.keys(game.set.kingdom).filter(function(card) {
			return game.set.kingdom[card].length === 0;
		});
		if (zeroPiles.length >= 3 ||
				zeroPiles.includes('province') ||
				zeroPiles.includes('colony')) {
			var playerScores = game.players.filter(function(pl) {
				return pl;
			}).map(function(pl) {
				var pointCards = pl.hand.concat(pl.discard).concat(pl.inPlay).concat(pl.deck).filter(function(ca) {
					return ca.types.includes('victory') || ca.types.includes('curse');
				});
				var pointCardsRef = {};
				for (var i = 0; i < pointCards.length; i++) {
					var pointCard = pointCards[i];
					if (pointCardsRef[pointCard.name]) {
						pointCardsRef[pointCard.name].amt++;
					} else {
						pointCardsRef[pointCard.name] = {
							amt: 1,
							points: pointCard.victoryPoints
						};
					}
				}
				var score = pointCards.reduce(function(res, ca) {
					ca.effect(pl, game);
					return res + ca.victoryPoints;
				}, 0);
				return {
					name: pl.name,
					score: score,
					cards: pointCardsRef,
					show: false
				};
			}).sort(function(scoreA, scoreB) {
				return scoreA.score === scoreB.score ? 0 : +(scoreA.score < scoreB.score) || -1;
			});
			this.io.in(room).emit('_end_score', playerScores);
			
			this.initRoom(room);
		} else {
			player.resource.action = 0;
			player.resource.buy = 0;
			player.resource.coin = 0;
			player.resource.potion = 0;
			this.cleanUp(player);
			player.reaction = [];
			player.draw(5);
			player.phase = 0;
			
			player.nextPlayer(game);
			
			var newPlayer = game.players[game.turn];
			newPlayer.resource.action = 1;
			newPlayer.resource.buy = 1;
			newPlayer.phase = 1;
			this.emitPlayer(newPlayer, room);
			
			this.emitBoard(null, room);
		}
	}
	this.emitPlayer(player, room);
};

Game.prototype.applyAction = function(player, room) {
	var game = this.rooms[room];
	if (game && game.state === "in_progress" && player.phase === 4) {
		if (player.todo[0]()) {
			player.todo.shift();
			this.cleanGame(player, game);
			this.emitBoard(null, room);
		}
	}
	this.emitPlayer(player, room);
};

Game.prototype.applyAttack = function(player, room) {
	var game = this.rooms[room];
	if (game && game.state === "in_progress" && player.phase === 6) {
		if (player.attack.effect()) {
			player.attack.next();
			this.emitPlayer(game.players[game.turn], room);
			player.attack = null;
			this.cleanGame(player, game);
			this.emitBoard(null, room);
		}
	}
	this.emitPlayer(player, room);
};

Game.prototype.cleanGame = function(player, game) {
	player.discard = player.discard.map(function(card) {
		card.selected = false;
		return card;
	});
	player.inPlay = player.inPlay.map(function(card) {
		card.selected = false;
		return card;
	});
	player.hand = player.hand.map(function(card) {
		card.selected = false;
		return card;
	});
	Object.keys(game.set.kingdom).forEach(function(pileName) {
		var pile_amt = game.set.kingdom[pileName].length;
		if (pile_amt) {
			game.set.kingdom[pileName][pile_amt - 1].selected = false;
		}
	});
};

Game.prototype.applyReaction = function(player, room) {
	var game = this.rooms[room];
	if (game && game.state === "in_progress" && player.phase === 5) {
		var selected = player.reaction.filter(function(reactionCard) {
			return reactionCard.selected;
		});
		var afterReact = false;
		if (selected.length === 0) {
			afterReact = true;
		} else if (selected.length === 1) {
			var sel = selected[0];
			sel.selected = false;
			if (sel.effect(player, game, player.hand.indexOf(selected[0]), 'reaction')) {
				if (player.reaction.length === 0) {
					afterReact = true;
				} else {
					this.cleanGame(player, game);
					this.emitBoard(null, room);
				}
				this.io.in(room).emit('_reaction', player.name + ' reacts with ' + sel.name);
			}
		}
		
		if (afterReact) {
			if (player.attack.effect !== null) {
				player.phase = 6;
			} else {
				player.attack.next();
				this.emitPlayer(game.players[game.turn], room);
				player.attack = null;
			}
			this.cleanGame(player, game);
			this.emitBoard(null, room);
		}
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

Game.prototype.clickCard = function(user, type, card) {
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

Game.prototype.doAction = function(game, room, card, player, cardIndex) {
	if (player.resource.action) {
		player.resource.action--;
		card.effect(player, game, cardIndex, 'action');
		if (game.players[game.turn] !== player) {
			this.emitPlayer(game.players[game.turn], room);
		}
		this.emitPlayer(player, room);
		this.emitBoard(null, room);
	}
};

Game.prototype.doTreasure = function(game, room, card, player, cardIndex) {
	if (player) {
		player.phase = 2;
		card.effect(player, game, cardIndex);
		this.emitPlayer(player, room, cardIndex);
		this.emitBoard(null, room);
	}
};

Game.prototype.playCard = function(game, room, card, player, possible, cardIndex) {
	if (possible.includes('action') && possible.includes('treasure')) {
		// crown card
	} else if (possible.includes('action')) {
		this.doAction(game, room, card, player, cardIndex);
	} else if (possible.includes('treasure')) {
		this.doTreasure(game, room, card, player, cardIndex);
	}
};

Game.prototype.handleInHand = function(user, cardIndex) {
	var room = user.inGame;
	var game = this.rooms[room];
	if (game && game.state === "in_progress") {
		var player = game.players[game.turn];
		if (player.id === user.id && cardIndex in player.hand) {
			var card = player.hand[cardIndex];
			if (card) {
				if (player.phase >= 1 && player.phase <= 2) {
					var phase = player.phase === 1 ? ['action', 'treasure'] : ['treasure'];
					var possiblePlays = phase.filter(function(n) {
						return card.types.indexOf(n) !== -1;
					});
					this.playCard(game, room, card, player, possiblePlays, cardIndex);
				} else if (player.phase >= 4 && player.phase <= 6) {
					card.selected = !card.selected;
					this.emitPlayer(player, room);
					this.emitBoard(null, room);
				}
			}
		}
	}
};

Game.prototype.handleBuy = function(user, card) {
	var room = user.inGame;
	var game = this.rooms[room];
	if (game && game.state === "in_progress") {
		var player = game.players[game.turn];
		var kingdom = game.set.kingdom;
		if (player.id === user.id && kingdom[card].length) {
			var kingdomCard = kingdom[card][kingdom[card].length - 1];
			if (player.phase >= 1 && player.phase <= 3) {
				if ((kingdomCard.coinCost <= player.resource.coin) &&
						(kingdomCard.potCost <= player.resource.potion) &&
						player.resource.buy) {
					player.phase = 3;
					
					player.resource.coin -= kingdomCard.coinCost;
					player.resource.potion -= kingdomCard.potCost;
					player.resource.buy--;
					
					player.gain(kingdom, 'discard', card, 1);
					this.emitPlayer(player, room);
					this.emitBoard(null, room);
				}
			} else if (player.phase === 4) {
				kingdomCard.selected = !kingdomCard.selected;
				this.emitPlayer(player, room);
				this.emitBoard(null, room);
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
	var game = this.rooms[room];
	var socketRoom = this.io.sockets.adapter.rooms[room];
	
	if (player &&
			socketRoom &&
			player.id in socketRoom.sockets &&
			game) {
		player.socket.emit(
			'_game_player', {
				name: player.name,
				deckSize: player.deck ? player.deck.length: null,
				discard: player.discard ? player.discard.map(function(card) { return {name: card.name, sel: card.selected}; }) : [],
				inPlay: player.inPlay ? player.inPlay.map(function(card) { return {name: card.name, sel: card.selected}; }) : [],
				hand: player.hand ? player.hand.map(function(card) { return {name: card.name, sel: card.selected}; }) : [],
				resource: player.resource ? player.resource : {},
				turn: game.state === "init" ? true : player.phase > 0
			},
			...this.getAction(player, room));
	}
};

Game.prototype.getPlayer = function(player) {
	if (player) {
		return {
			name: player.name,
			deckSize: player.deck ? player.deck.length : null,
			discardTop: player.discard ? player.discard.slice(-1).map(function(card) { return {name: card.name, sel: card.selected}; }) : [],
			inPlay: player.inPlay ? player.inPlay.map(function(card) { return {name: card.name, sel: card.selected}; }) : [],
			hand: player.hand ? player.hand.map(function(card) { return {sel: card.selected}; }) : [],
			resource: player.resource ? player.resource : {},
			spot: player.spot,
			turn: player.phase > 0
		};
	}
};

Game.prototype.emitBoard = function(user, room) {
	var game = this.rooms[room];
	var socketRoom = this.io.sockets.adapter.rooms[room];
	if (game && socketRoom) {
		if (user) {
			user.emit('_game_board', this.getGameBoard(game, user.id));
		} else {
			var connectedUsers = socketRoom.sockets;

			Object.keys(connectedUsers).forEach(function(connectedUser) {
				this.io.to(connectedUser).emit('_game_board', this.getGameBoard(game, connectedUser));
			}, this);
		}
	}
};

Game.prototype.getGameBoard = function(game, user_id) {
	return {
		piles: Object.keys(game.set.kingdom).map(function(cardName) {
			var len = this[cardName].length;
			return {
				name: cardName,
				amt: len,
				sel: len ? this[cardName][len - 1].selected : false
			};
		}, game.set.kingdom),
		players: game.players.filter(function(player) {
			// do not emit self to player
			return player && player.id !== user_id;
		}).map(this.getPlayer).map(function(player) {
			player.turn = game.state === "init" ? true : player.turn;
			return player;
		}),
		trash: game.trash.map(function(card) {
			return {
				name: card.name,
				sel: card.selected
			};
		})
	};
};

Game.prototype.getAction = function(player, room) {
	var game = this.rooms[room];
	if (game) {
		if (game.state === 'init') {
			return ["start_game", this.start.bind(this, player, room)];
		}
		
		switch (player.phase) {
			case 0:
				// standby phase
				break;
			case 1:
				return ["end_turn", this.end.bind(this, player, room)];
			case 2:
				return ["end_turn", this.end.bind(this, player, room)];
			case 3:
				return ["end_turn", this.end.bind(this, player, room)];
			case 4:
				return ["apply_action", this.applyAction.bind(this, player, room)];
			case 5:
				return ["apply_reaction", this.applyReaction.bind(this, player, room)];
			case 6:
				return ["apply_attack", this.applyAttack.bind(this, player, room)];
			default:
				// do nothing
		}
	}
	return [null, null];
};

module.exports = Game;