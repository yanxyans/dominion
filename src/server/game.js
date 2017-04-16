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
			kingdom: {},
			kingdomCards: {}
		};
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
				seated: true
			};
			
			game.players[playerSpot] = player;
			// get player resources and action if applicable
			this.emitPlayer(player, room);
			this.emitRoomBoard(room);
		} else {
			// get board state
			user.emit('_game_board', {
				piles: Object.keys(game.set.kingdom).map(function(cardKey) {
					return {
						name: cardKey,
						amt: this.kingdom[cardKey],
						sel: this.kingdomCards[cardKey].selected,
						coinCost: this.kingdomCards[cardKey].coinCost,
						potCost: this.kingdomCards[cardKey].potCost
					};
				}, game.set),
				players: game.players.filter(function(player) {
					return player !== null;
				}).map(this.getPlayer).map(function(player) {
					player.turn = game.phase ? (game.turn === player.spot) : true;
					return player;
				}),
				trash: game.trash.map(function(card) {
					return card.name;
				})
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
			} else {
				// attempt reconnect
				game.players[playerSpot].id = null;
				game.players[playerSpot].name = 'disc';
				game.players[playerSpot].socket = null;
				game.players[playerSpot].seated = false;
			}
			this.emitRoomBoard(room);
		}
	}
};

Game.prototype.reconnect = function(user, spot) {
	var room = user.inGame;
	var game = this.rooms[room];
	if (game && game.players[spot] && !game.players[spot].seated) {
		game.players[spot].id = user.id;
		game.players[spot].name = user.name;
		game.players[spot].socket = user.socket;
		game.players[spot].seated = true;
		
		game.users[user.id].type = 1;
		user.games[room] = spot;
		
		this.emitPlayer(game.players[spot], room);
		this.emitRoomBoard(room);
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
			user.emit('_game_board', {
				piles: Object.keys(game.set.kingdom).map(function(cardKey) {
					return {
						name: cardKey,
						amt: this.kingdom[cardKey],
						sel: this.kingdomCards[cardKey].selected,
						coinCost: this.kingdomCards[cardKey].coinCost,
						potCost: this.kingdomCards[cardKey].potCost
					};
				}, game.set),
				players: game.players.filter(function(player) {
					return player && player.id !== user.id;
				}).map(this.getPlayer).map(function(player) {
					player.turn = game.phase ? (game.turn === player.spot) : true;
					return player;
				}),
				trash: game.trash.map(function(card) {
					return card.name;
				})
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
		
		var players = game.players.filter(function(player) {
			return player !== null;
		});
		
		// init board
		Object.keys(game.originSet.start).forEach(function(key) {
			game.set.start[key] = game.originSet.start[key];
		});
		Object.keys(game.originSet.kingdom).forEach(function(key) {
			game.set.kingdom[key] = game.originSet.kingdom[key];
			game.set.kingdomCards[key] = getCard(key);
			
			if (key === 'curse') {
				game.set.kingdom[key] = game.set.kingdom[key] - (4 - players.length) * 10;
			} else if (key === 'estate') {
				game.set.kingdom[key] = game.set.kingdom[key] - (4 - players.length) * 3 - (players.length === 2 ? 4 : 0);
			} else if (key === 'duchy' && players.length === 2) {
				game.set.kingdom[key] = game.set.kingdom[key] - 4;
			} else if (key === 'province' && players.length === 2) {
				game.set.kingdom[key] = game.set.kingdom[key] - 4;
			} else if (key === 'colony' && players.length === 2) {
				game.set.kingdom[key] = game.set.kingdom[key] - 4;
			}
		}, this);
		
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
				action: 0,
				buy: 0,
				coin: 0,
				potion: 0
			};
			gamePlayer.todo = [];
			gamePlayer.attack = null;
			gamePlayer.reaction = [];
			
			startCards.forEach(function(startCard) {
				var startCardAmt = set.start[startCard];
				gain(set.kingdom, gamePlayer.discard, startCard, startCardAmt);
			}, this);
			draw(gamePlayer, 5);
			this.emitPlayer(gamePlayer, room);
		}
		
		players[0].resource.action = 1;
		players[0].resource.buy = 1;
		this.emitRoomBoard(room);
	}
};

Game.prototype.end = function(player, room) {
	var game = this.rooms[room];
	if (game && game.phase >= 1 && game.phase <= 3) {
		var zeroPiles = Object.keys(game.set.kingdom).filter(function(card) {
			return game.set.kingdom[card] === 0;
		});
		if (zeroPiles.length >= 3 ||
				zeroPiles.includes('province') ||
				zeroPiles.includes('colony')) {
			var playerScores = game.players.filter(function(pl) {
				return pl;
			}).map(function(pl) {
				var score = pl.hand.concat(pl.discard).concat(pl.inPlay).concat(pl.deck).filter(function(ca) {
					return ca.types.includes('victory') || ca.types.includes('curse');
				}).reduce(function(res, ca) {
					ca.effect(pl, game);
					return res + ca.victoryPoints;
				}, 0);
				return {
					name: pl.name,
					score: score
				};
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
			draw(player, 5);
			
			game.turn = (game.turn + 1) % 4;
			while (game.players[game.turn] === null) {
				game.turn = (game.turn + 1) % 4;
			}
			game.phase = 1;

			var newPlayer = game.players[game.turn];
			newPlayer.resource.action = 1;
			newPlayer.resource.buy = 1;
			
			this.emitRoomBoard(room);
		}
	}
	this.emitPlayer(player, room);
};

Game.prototype.applyAction = function(player, room) {
	var game = this.rooms[room];
	if (game && game.phase === 4) {
		if (player.todo[0]()) {
			player.todo.shift();
			this.cleanGame(player, game);
			this.emitRoomBoard(room);
		}
	}
	this.emitPlayer(player, room);
};

Game.prototype.applyAttack = function(player, room) {
	var game = this.rooms[room];
	if (game && game.phase === 6) {
		if (player.attack.effect()) {
			player.attack.next();
			player.attack = null;
			this.cleanGame(player, game);
			this.emitRoomBoard(room);
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
	Object.keys(game.set.kingdomCards).forEach(function(cardKey) {
		game.set.kingdomCards[cardKey].selected = false;
	});
};

Game.prototype.applyReaction = function(player, room) {
	var game = this.rooms[room];
	if (game && game.phase === 5) {
		var selected = player.reaction.filter(function(reactionCard) {
			return reactionCard.selected;
		});
		if (selected.length === 0) {
			game.phase = 6;
			this.cleanGame(player, game);
			this.emitRoomBoard(room);
		} else if (selected.length === 1) {
			var sel = selected[0];
			sel.selected = false;
			if (sel.effect(player, game, player.hand.indexOf(selected[0]), 'reaction')) {
				if (player.reaction.length === 0) {
					game.phase = 6
				}
				this.cleanGame(player, game);
				this.emitRoomBoard(room);
				this.io.in(room).emit('_reaction', player.name + ' reacts with ' + sel.name);
			}
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

function gain(src, dest, card, amt) {
	var pile_amt = src[card];
	var gain_amt = Math.min(amt, pile_amt);
	src[card] -= gain_amt;
	
	for (var i = 0; i < gain_amt; i++) {
		dest.push(getCard(card));
	}
};

function treasureCard(name, coinCost, potCost, coinValue, potValue, types, effect, selected) {
	this.name = name;
	this.coinCost = coinCost;
	this.potCost = potCost;
	this.types = types;
	this.effect = function(player, game, cardIndex) {
		player.inPlay.push(player.hand.splice(cardIndex, 1)[0]);
		
		player.resource.coin += coinValue;
		player.resource.potion += potValue;
		
		return effect(player, game);
	};
	this.selected = selected;
}

function victoryCard(name, coinCost, potCost, victoryPoints, types, effect, selected) {
	this.name = name;
	this.coinCost = coinCost;
	this.potCost = potCost;
	this.victoryPoints = victoryPoints;
	this.types = types;
	this.effect = function(player, game) {
		return effect(player, game);
	};
	this.selected = selected;
}

function actionCard(name, coinCost, potCost, types, effect, selected) {
	this.name = name;
	this.coinCost = coinCost;
	this.potCost = potCost;
	this.types = types;
	this.effect = function(player, game, cardIndex, effectType) {
		if (effectType === 'action') {
			player.inPlay.push(player.hand.splice(cardIndex, 1)[0]);
		}
		return effect(player, game, effectType);
	};
}

function gainAction(player, game, coinCost, potCost, types, gainDst, nextPhase) {
	var selected = Object.keys(game.set.kingdomCards).filter(function(cardKey) {
		var card = game.set.kingdomCards[cardKey];
		return card.selected && card.coinCost <= coinCost && card.potCost <= potCost && types.every(function(val) {
			return this.indexOf(val) > -1;
		}, card.types);
	});
	if (selected.length === 1) {
		var card = selected[0];
		game.set.kingdomCards[card] = false;
		gain(game.set.kingdom, player[gainDst], card, 1);
		if (player.todo.length === 1) {
			game.phase = 1;
		}
		return true;
	}
	return false;
}

function getCard(card) {
	switch (card) {
		case 'copper':
			return new treasureCard("copper", 0, 0, 1, 0, ["treasure"], function() { return true; }, false);
		case 'silver':
			return new treasureCard("silver", 3, 0, 2, 0, ["treasure"], function() { return true; }, false);
		case 'gold':
			return new treasureCard("gold", 6, 0, 3, 0, ["treasure"], function() { return true; }, false);
		case 'estate':
			return new victoryCard("estate", 2, 0, 1, ["victory"], function() { return true; }, false);
		case 'duchy':
			return new victoryCard("duchy", 5, 0, 3, ["victory"], function() { return true; }, false);
		case 'province':
			return new victoryCard("province", 8, 0, 6, ["victory"], function() { return true; }, false);
		case 'curse':
			return new victoryCard("curse", 0, 0, -1, ["curse"], function() { return true; }, false);
		case 'cellar':
			return new actionCard("cellar", 2, 0, ["action"], function(player, game) {
				player.resource.action++;
				game.phase = 4;
				var cellarAction = function(player, game) {
					var selected = [];
					player.hand.forEach(function(el, index) {
						if (el.selected) {
							selected.push(index);
						}
					});
					var drawAmt = selected.length;
					for (var i = selected.length - 1; i > -1; i--) {
						var selectedCard = player.hand.splice(selected[i], 1)[0];
						selectedCard.selected = false;
						player.discard.push(selectedCard);
					}
					draw(player, drawAmt);
					if (player.todo.length === 1) {
						game.phase = 1;
					}
					return true;
				};
				player.todo.push(cellarAction.bind(null, player, game));
				return true;
			}, false);
		case 'market':
			return new actionCard("market", 5, 0, ["action"], function(player) {
				draw(player, 1);
				player.resource.action++;
				player.resource.buy++;
				player.resource.coin++;
				return true;
			}, false);
		case 'militia':
			return new actionCard("militia", 4, 0, ["action", "attack"], function(player, game) {
				player.resource.coin += 2;
				
				var players = game.players.filter(function(pl) {
					return pl;
				});
				players.forEach(function(pl, index) {
					if (pl.id === player.id) {
						// don't attack yourself
					} else {
						pl.attack = {
							effect: function() {
								var handSize = pl.hand.length;
								if (handSize <= 3) {
									return true;
								}
								
								var selected = pl.hand.filter(function(card) {
									return card.selected;
								});
								var selLength = selected.length;
								var remLength = handSize - selLength;
								if (remLength >= 3) {
									for (var i = 0; i < selLength; i++) {
										selected[i].selected = false;
										pl.discard.push(pl.hand.splice(pl.hand.indexOf(selected[i]), 1)[0]);
									}
									if (remLength === 3) {
										return true;
									}
								}
								return false;
							},
							next: function() {
								game.turn = players[(index + 1) % players.length].spot;
								
								var nextPlayer = game.players[game.turn];
								game.phase = nextPlayer.attack ? (nextPlayer.reaction.length ? 5 : 6) : 1;
							}
						};
					}
				});
				
				game.turn = (game.turn + 1) % 4;
				while (game.players[game.turn] === null) {
					game.turn = (game.turn + 1) % 4;
				}
				game.phase = game.players[game.turn].reaction.length ? 5 : 6;
				
				return true;
			}, false);
		case 'mine':
			return new actionCard("mine", 5, 0, ["action"], function(player, game) {
				game.phase = 4;
				var mineAction = function(player, game) {
					var selected = player.hand.filter(function(card) {
						return card.selected && card.types.includes('treasure');
					});
					if (selected.length === 0) {
						if (player.todo.length === 1) {
							game.phase = 1;
						}
						return true;
					} else if (selected.length === 1) {
						var card = selected[0];
						card.selected = false;
						game.trash.push(player.hand.splice(player.hand.indexOf(card), 1)[0]);
						player.todo.splice(1, 0, gainAction.bind(null, player, game, card.coinCost + 3, card.potCost, ['treasure'], 'hand'));
						return true;
					}
					return false;
				};
				player.todo.push(mineAction.bind(null, player, game));
				return true;
			}, false);
		case 'moat':
			return new actionCard("moat", 2, 0, ["action", "reaction"], function(player, game, effectType) {
				if (effectType === 'action') {
					draw(player, 2);
				} else if (effectType === 'reaction') {
					if (player.attack) {
						player.attack.effect = function() {
							return true;
						};
					}
				}
				return true;
			}, false);
		case 'remodel':
			return new actionCard("remodel", 4, 0, ["action"], function(player, game) {
				game.phase = 4;
				var remodelAction = function(player, game) {
					var selected = player.hand.filter(function(card) {
						return card.selected;
					});
					if (selected.length === 0 && player.hand.length === 0) {
						if (player.todo.length === 1) {
							game.phase = 1;
						}
						return true;
					} else if (selected.length === 1) {
						var card = selected[0];
						card.selected = false;
						game.trash.push(player.hand.splice(player.hand.indexOf(card), 1)[0]);
						player.todo.splice(1, 0, gainAction.bind(null, player, game, card.coinCost + 2, card.potCost, [], 'discard'));
						return true;
					}
					return false;
				};
				player.todo.push(remodelAction.bind(null, player, game));
				return true;
			}, false);
		case 'smithy':
			return new actionCard("smithy", 4, 0, ["action"], function(player) {
				draw(player, 3);
				return true;
			}, false);
		case 'village':
			return new actionCard("village", 3, 0, ["action"], function(player) {
				draw(player, 1);
				player.resource.action += 2;
				return true;
			}, false);
		case 'woodcutter':
			return new actionCard("woodcutter", 3, 0, ["action"], function(player) {
				player.resource.buy++;
				player.resource.coin += 2;
				return true;
			}, false);
		case 'workshop':
			return new actionCard("workshop", 4, 0, ["action"], function(player, game) {
				game.phase = 4;
				player.todo.push(gainAction.bind(null, player, game, 4, 0, [], 'discard'));
				return true;
			}, false);
		default:
			return undefined;
	}
};

function draw(player, amt) {
	if (player) {
		var deck_amt = player.deck.length;
		var draw_amt = Math.min(amt, deck_amt);
		
		for (var i = 0; i < draw_amt; i++) {
			var handCard = player.deck.pop();
			if (handCard.types.includes('reaction')) {
				player.reaction.push(handCard);
			}
			player.hand.push(handCard);
		}
		if (draw_amt < amt && player.discard.length) {
			shuffle(player.discard);
			[player.deck, player.discard] = [player.discard, player.deck];
			draw(player, amt - draw_amt);
		}
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
		this.emitPlayer(player, room);
		this.emitRoomBoard(room);
	}
};

Game.prototype.doTreasure = function(game, room, card, player, cardIndex) {
	game.phase = 2;
	card.effect(player, game, cardIndex);
	this.emitPlayer(player, room, cardIndex);
	this.emitRoomBoard(room);
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
	if (game && game.phase) {
		var player = game.players[game.turn];
		if (player.id === user.id && cardIndex in player.hand) {
			var card = player.hand[cardIndex];
			if (card) {
				if (game.phase >= 1 && game.phase <= 2) {
					var phase = game.phase === 1 ? ['action', 'treasure'] : ['treasure'];
					var possiblePlays = phase.filter(function(n) {
						return card.types.indexOf(n) !== -1;
					});
					this.playCard(game, room, card, player, possiblePlays, cardIndex);
				} else if (game.phase === 4 ||
									 game.phase === 5 ||
									 game.phase === 6) {
					card.selected = !card.selected;
					this.emitPlayer(player, room);
					this.emitRoomBoard(room);
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
			var kingdomCard = game.set.kingdomCards[card];
			if (game.phase >= 1 && game.phase <= 3) {
				if ((kingdomCard.coinCost <= player.resource.coin) &&
						(kingdomCard.potCost <= player.resource.potion) &&
						player.resource.buy) {
					game.phase = 3;
					
					player.resource.coin -= kingdomCard.coinCost;
					player.resource.potion -= kingdomCard.potCost;
					player.resource.buy--;
					
					gain(kingdom, player.discard, card, 1);
					this.emitPlayer(player, room);
					this.emitRoomBoard(room);
				}
			} else if (game.phase === 4) {
				kingdomCard.selected = !kingdomCard.selected;
				this.emitPlayer(player, room);
				this.emitRoomBoard(room);
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
	if (game && game.phase && game.players[game.turn].id !== player.id) {
		this.emitPlayer(game.players[game.turn], room);
	}
	
	var socketRoom = this.io.sockets.adapter.rooms[room];
	if (player &&
			socketRoom &&
			player.id in socketRoom.sockets) {
		player.socket.emit(
			'_game_player', {
				name: player.name,
				deckSize: player.deck ? player.deck.length: null,
				discard: player.discard ? player.discard.map(function(card) { return {name: card.name, sel: card.selected}; }) : [],
				inPlay: player.inPlay ? player.inPlay.map(function(card) { return {name: card.name, sel: card.selected}; }) : [],
				hand: player.hand ? player.hand.map(function(card) { return {name: card.name, sel: card.selected}; }) : [],
				resource: player.resource ? player.resource : {},
				turn: game && game.phase ? (player.spot === game.turn) : true
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
			hand: player.hand ? player.hand.map(function(card) { return {name: 'hidden', sel: card.selected}; }) : [],
			resource: player.resource ? player.resource : {},
			spot: player.spot
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
				piles: Object.keys(game.set.kingdom).map(function(cardKey) {
					return {
						name: cardKey,
						amt: this.kingdom[cardKey],
						sel: this.kingdomCards[cardKey].selected,
						coinCost: this.kingdomCards[cardKey].coinCost,
						potCost: this.kingdomCards[cardKey].potCost
					};
				}, game.set),
				players: game.players.filter(function(player) {
					return player && player.id !== user;
				}).map(this.getPlayer).map(function(player) {
					player.turn = game.phase ? (game.turn === player.spot) : true;
					return player;
				}),
				trash: game.trash.map(function(card) {
					return card.name;
				})
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
				return ["Apply Action", this.applyAction.bind(this, player, room)];
			case 5:
				return ["Apply Reaction", this.applyReaction.bind(this, player, room)];
			case 6:
				return ["Apply Attack", this.applyAttack.bind(this, player, room)];
			default:
				// do nothing
		}
	}
	return [null, null];
};

module.exports = Game;