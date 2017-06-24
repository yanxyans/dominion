var COPPER_VALUE = 1;
var SILVER_VALUE = 2;
var GOLD_VALUE = 3;
var ESTATE_VALUE = 1;
var DUCHY_VALUE = 3;
var PROVINCE_VALUE = 6;
var CURSE_VALUE = 1;

var Item = require('./item');
var Task = require('./task');

function incPlayerCoin(value) {
	return function(player, game) {
		if (player) {
			game.coin += value;
		}
	};
}

function incPlayerPoints(points) {
	return function(player, game) {
		if (player) {
			player.points += points;
		}
	};
}

function decPlayerPoints(points) {
	return function(player, game) {
		if (player) {
			player.points -= points;
		}
	};
}

function selectItem(main, trigger, type, player, valid, selectable, controls, selected) {
	var turn = player.seat;
	
	var selectTask = new Task(turn,
		function(item) {
			// do nothing
		},
		valid, valid(),
		function(ret) {
			var playerView = ret.players[turn];
			var visible = playerView.visible;
			if (visible) {
				playerView.control = Object.keys(controls);
			}
		},
		function(cards, index) {
			var card = selectable(cards, index, selected);
			if (!card) {
				return;
			}
			
			var found = selected.indexOf(card);
			if (found === -1) {
				// select
				selected.push(card);
			} else {
				// deselect
				selected.splice(found, 1);
			}
		},
		controls);
	
	return new Item([selectTask, ...main], trigger, type, turn);
}

function cellarAction(player, game) {
	if (player && game) {
		game.action++;
		
		var turn = player.seat;
		var selected = [];
		
		var discard = discardTask(player, selected);
		var draw = new Task(turn,
			function(item) {
				var amt = selected.length;
				player.draw(amt);
			}, undefined, true);
			
		var discardItem = new Item([discard], [], "discard", turn);
		var drawItem = new Item([draw], [], "draw", turn);
		
		var discardTa = new Task(turn,
			function(item) {
				if (selected.length) {
					item.todo.push(discardItem);
				}
			}, undefined, true);
		var drawTask = new Task(turn,
			function(item) {
				if (selected.length) {
					item.todo.push(drawItem);
				}
			}, undefined, true);
			
		var playItem = selectItem([discardTa, drawTask], [], "play", player,
			function() {
				return player.hand.length < 1;
			},
			function(cards, index, selected) {
				if (cards === player.hand && index in cards) {
					return cards[index];
				}
				
				return null;
			},
			{
				Discard: function() {
					this.resolvable = true;
					return true;
				}
			},
			selected);
			
		game.todo.push(playItem);
	}
}

function marketAction(player, game) {
	if (player) {
		player.draw(1);
		game.action++;
		game.buy++;
		game.coin++;
	}
}

function militiaAction(player, game) {
	if (player && game) {
		game.coin += 2;
		
		let attacker = player.seat;
		let len = game.players.length;
		for (let i = 1; i < len; i++) {
			let toAttack = {};
			let index = (attacker + i) % len;
			toAttack[index] = game.players[index];
			
			let attackTask = new Task(attacker,
				function(item) {
					let attacked = toAttack[index];
					if (attacked && attacked.hand.length > 3) {
						item.todo.push(militiaAttack(attacked));
					}
				}, undefined, true);
			
			let attackItem = new Item([attackTask], [], "attack", attacker);
			attackItem.targets = toAttack;
			
			game.todo.push(attackItem);
		}
	}
}

function discardTask(player, selected) {
	var turn = player.seat;
	
	return new Task(turn,
		function(item) {
			var len = selected.length;
			for (var i = 0; i < len; i++) {
				var card = selected[i];
				var index = player.hand.indexOf(card);
				
				if (index !== -1) {
					player.hand.splice(index, 1);
					player.discard.push(card);
				}
			}
		}, undefined, true);
}

function militiaAttack(player) {
	var turn = player.seat;
	var selected = [];
	
	var discardTa = discardTask(player, selected);
	
	return selectItem([discardTa], [], "discard", player,
		function() {
			return player.hand.length < 4;
		},
		function(cards, index, selected) {
			if (cards === player.hand && index in cards) {
				var card = cards[index];
				if (player.hand.length - selected.length > 3 ||
					selected.indexOf(card) !== -1) {
					return card;
				}
			}
			
			return null;
		},
		{
			Discard: function() {
				if (player.hand.length - selected.length === 3) {
					this.resolvable = true;
					return true;
				}
				return false;
			}
		},
		selected);
}

function moatAction(player, game) {
	if (player) {
		player.draw(2);
	}
}

function moatReaction(player, item) {
	if (item && player) {
		var targets = item.targets;
		var index = player.seat;
		if (targets && targets[index]) {
			delete targets[index];
		}
	}
}

function mineAction(player, game) {
	if (player && game) {
		
		var turn = player.seat;
		var selected = [];
		var gained = [];
		
		var trashIt = trashItem(player, game, selected);
		
		var trashTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					item.todo.push(trashIt);
				}
			}, undefined, true);
		var gainTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					
					item.todo.push(gainItem(player, game,
						function() {
							return Object.keys(game.pilesWork).filter(function(name) {
								var pile = game.pilesWork[name];
								if (pile.length > 0 && selected.length === 1) {
									var newCard = pile[0];
									var oldCard = selected[0];
									return 'treasure' in newCard.types &&
										   newCard.coin <= oldCard.coin + 3;
								}
								return false;
							}).length === 0;
						},
						function(cards, index, gained) {
							var piles = game.pilesWork;
							if (cards in piles && index in piles[cards] && selected.length === 1) {
								var newCard = piles[cards][index];
								var oldCard = selected[0];
								if (('treasure' in newCard.types &&
									newCard.coin <= oldCard.coin + 3 &&
									gained.length < 1) ||
									gained.indexOf(newCard) !== -1) {
									return newCard;
								}
							}
							
							return null;
						}, gained, player.hand));
				}
			}, undefined, true);
		
		var playItem = selectItem([trashTask, gainTask], [], "play", player,
			function() {
				return player.hand.filter(function(card) {
					return 'treasure' in card.types;
				}) < 1;
			},
			function(cards, index, selected) {
				if (cards === player.hand && index in cards) {
					var card = cards[index];
					if ((selected.length < 1 &&
						'treasure' in card.types) ||
						selected.indexOf(card) !== -1) {
						return card;
					}
				}
				
				return null;
			},
			{
				Trash: function() {
					this.resolvable = true;
					return true;
				}
			},
			selected);
		
		game.todo.push(playItem);
	}
}

function trashItem(player, game, selected) {
	var turn = player.seat;
	
	var trash = new Task(turn,
		function(item) {
			var len = selected.length;
			if (len === 1) {
				var card = selected[0];
				var index = player.hand.indexOf(card);
				if (index !== -1) {
					player.hand.splice(index, 1)[0];
					game.trash.push(card);
				}
			}
		}, undefined, true);
	
	return new Item([trash], [], "trash", turn);
}

function remodelAction(player, game) {
	if (player && game) {

		var turn = player.seat;
		var selected = [];
		var gained = [];
		
		var trashIt = trashItem(player, game, selected);
		
		var trashTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					item.todo.push(trashIt);
				}
			}, undefined, true);
		var gainTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					
					item.todo.push(gainItem(player, game,
						function() {
							return Object.keys(game.pilesWork).filter(function(name) {
								var pile = game.pilesWork[name];
								if (pile.length > 0 && selected.length === 1) {
									var newCard = pile[0];
									var oldCard = selected[0];
									return newCard.coin <= oldCard.coin + 2;
								}
								return false;
							}).length === 0;
						},
						function(cards, index, gained) {
							var piles = game.pilesWork;
							if (cards in piles && index in piles[cards] && selected.length === 1) {
								var newCard = piles[cards][index];
								var oldCard = selected[0];
								if ((newCard.coin <= oldCard.coin + 2 &&
									gained.length < 1) ||
									gained.indexOf(newCard) !== -1) {
									return newCard;
								}
							}
							
							return null;
						}, gained, player.discard));
				}
			}, undefined, true);
		
		var playItem = selectItem([trashTask, gainTask], [], "play", player,
			function() {
				return player.hand.length < 1;
			},
			function(cards, index, selected) {
				if (cards === player.hand && index in cards) {
					var card = cards[index];
					if (selected.length < 1 ||
						selected.indexOf(card) !== -1) {
						return card;
					}
				}
				
				return null;
			},
			{
				Trash: function() {
					if (selected.length === 1) {
						this.resolvable = true;
						return true;
					}
					
					return false;
				}
			},
			selected);
		
		game.todo.push(playItem);
	}
}

function smithyAction(player, game) {
	if (player) {
		player.draw(3);
	}
}

function villageAction(player, game) {
	if (player) {
		player.draw(1);
		game.action += 2;
	}
}

function woodcutterAction(player, game) {
	if (player) {
		game.buy++;
		game.coin += 2;
	}
}

function getWorkshopPiles(piles) {
	return Object.keys(piles).filter(function(name) {
		var pile = piles[name];
		return pile.length > 0 && pile[0].coin <= 4;
	});
}

function gainItem(player, game, valid, selectable, selected, dest) {
	var turn = player.seat;
	
	var gain = new Task(turn,
		function(item) {
			var len = selected.length;
			if (len === 1) {
				var card = selected[0];
				var keys = Object.keys(game.pilesWork).filter(function(name) {
					var pile = game.pilesWork[name];
					return pile.indexOf(card) !== -1;
				});
				
				if (keys.length === 1) {
					var pile = game.pilesWork[keys[0]];
					var index = pile.indexOf(card);
					if (index !== -1) {
						pile.splice(index, 1);
						dest.push(card);
					}
				}
			}
		}, undefined, true);
	
	return selectItem([gain], [], "gain", player, valid, selectable,
		{
			Gain: function() {
				if (selected.length === 1) {
					this.resolvable = true;
					return true;
				}
				
				return false;
			}
		},
		selected);
}

function workshopAction(player, game) {
	if (player && game) {
		
		var turn = player.seat;
		var selected = [];					
		
		var gainIt = gainItem(player, game,
			function() {
				return getWorkshopPiles(game.pilesWork).length === 0;
			},
			function(cards, index, selected) {
				var piles = game.pilesWork;
				if (cards in piles && index in piles[cards]) {
					var card = piles[cards][index];
					if ((card.coin <= 4 &&
						selected.length < 1) ||
						selected.indexOf(card) !== -1) {
						return card;
					}
				}
				
				return null;
			}, selected, player.discard);
			
		var gainTask = new Task(turn,
			function(item) {
				if (getWorkshopPiles(game.pilesWork).length > 0) {
					item.todo.push(gainIt);
				}
			}, undefined, true);
		
		var playItem = new Item([gainTask], [], "play", turn);
		
		game.todo.push(playItem);
	}
}

function moatReact(player, item) {
	if (item) {
		var type = item.type;
		var state = item.state;
		var index = player.seat
		var targets = item.targets;
		return type === "attack" && state === "PRE" && targets && index in targets;
	}
	return false;
}

function getCardAttributes(name) {
	switch (name) {
		case 'cellar':
			return {
				coin: 2,
				types: {
					action: cellarAction
				}
			};
		case 'copper':
			return {
				coin: 0,
				types: {
					treasure: incPlayerCoin(COPPER_VALUE)
				}
			};
		case 'curse':
			return {
				coin: 0,
				types: {
					curse: decPlayerPoints(CURSE_VALUE)
				}
			};
		case 'duchy':
			return {
				coin: 5,
				types: {
					victory: incPlayerPoints(DUCHY_VALUE)
				}
			};
		case 'estate':
			return {
				coin: 2,
				types: {
					victory: incPlayerPoints(ESTATE_VALUE)
				}
			};
		case 'gold':
			return {
				coin: 6,
				types: {
					treasure: incPlayerCoin(GOLD_VALUE)
				}
			};
		case 'market':
			return {
				coin: 5,
				types: {
					action: marketAction
				}
			};
		case 'militia':
			return {
				coin: 4,
				types: {
					attack: militiaAttack,
					action: militiaAction
				}
			};
		case 'mine':
			return {
				coin: 5,
				types: {
					action: mineAction
				}
			};
		case 'moat':
			return {
				coin: 2,
				types: {
					action: moatAction,
					reaction: moatReaction
				},
				canReact: moatReact
			};
		case 'province':
			return {
				coin: 8,
				types: {
					victory: incPlayerPoints(PROVINCE_VALUE)
				}
			};
		case 'remodel':
			return {
				coin: 4,
				types: {
					action: remodelAction
				}
			};
		case 'silver':
			return {
				coin: 3,
				types: {
					treasure: incPlayerCoin(SILVER_VALUE)
				}
			};
		case 'smithy':
			return {
				coin: 4,
				types: {
					action: smithyAction
				}
			};
		case 'village':
			return {
				coin: 3,
				types: {
					action: villageAction
				}
			};
		case 'woodcutter':
			return {
				coin: 3,
				types: {
					action: woodcutterAction
				}
			};
		case 'workshop':
			return {
				coin: 3,
				types: {
					action: workshopAction
				}
			};
		default:
			return {
				coin: null,
				types: {}
			};
	}
}

function Card(name) {
	var attributes = getCardAttributes(name);
	
	this.name = name;
	this.coin = attributes.coin;
	this.types = attributes.types;
	
	if (attributes.canReact) {
		this.canReact = attributes.canReact;
	}
}

module.exports = Card;