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
		
		var discard = new Task(turn,
			function(item) {
				var len = selected.length;
				for (var i = 0; i < len; i++) {
					var index = player.hand.indexOf(selected[i]);
					if (index !== -1) {
						player.discard.push(player.hand.splice(index, 1)[0]);
					}
				}
			}, undefined, true);
		var draw = new Task(turn,
			function(item) {
				var amt = selected.length;
				player.draw(amt);
			}, undefined, true);
			
		var discardItem = new Item([discard], [], "discard", turn);
		var drawItem = new Item([draw], [], "draw", turn);
		
		var discardTask = new Task(turn,
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
			
		var playItem = selectItem([discardTask, drawTask], [], "play", player,
			function() {
				return player.hand.length < 1;
			},
			function(cards, index, selectable) {
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

function militiaAttack(player) {
	var turn = player.seat;
	var selected = [];
	
	var discardTask = new Task(turn,
		function(item) {
			var len = selected.length;
			for (var i = 0; i < len; i++) {
				var index = player.hand.indexOf(selected[i]);
				if (index !== -1) {
					player.discard.push(player.hand.splice(index, 1)[0]);
				}
			}
		}, undefined, true);
	
	return selectItem([discardTask], [], "discard", player,
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
		var gain = new Task(turn,
			function(item) {
				var len = gained.length;
				if (len === 1) {
					var card = gained[0];
					var keys = Object.keys(game.pilesWork).filter(function(name) {
						var pile = game.pilesWork[name];
						return pile.indexOf(card) !== -1;
					});
					
					if (keys.length === 1) {
						var pile = game.pilesWork[keys[0]];
						var index = pile.indexOf(card);
						if (index !== -1) {
							pile.splice(index, 1);
							player.discard.push(card);
						}
					}
				}
			}, undefined, true);
		
		var trashItem = new Item([trash], [], "trash", turn);
		var gainItem = selectItem([gain], [], "gain", player,
			function() {
				return Object.keys(game.pilesWork).filter(function(name) {
					var pile = game.pilesWork[name];
					if (pile.length > 0 && selected.length === 1) {
						var newCard = pile[0];
						var oldCard = selected[0];
						return 'treasure' in newCard.types &&
							   newCard.coin <= oldCard.coin + 3;
					}
				}).length > 0;
			},
			function(cards, index, selectable) {
				var piles = game.pilesWork
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
			},
			{
				Gain: function() {
					if (gained.length === 1) {
						this.resolvable = true;
						return true;
					}
					
					return false;
				}
			},
			gained);
			
		var trashTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					item.todo.push(trashItem);
				}
			}, undefined, true);
		var gainTask = new Task(turn,
			function(item) {
				if (selected.length === 1) {
					item.todo.push(gainItem);
				}
			}, undefined, true);
		
		var playItem = selectItem([trashTask, gainTask], [], "play", player,
			function() {
				return player.hand.filter(function(card) {
					return 'treasure' in card.types;
				}) < 1;
			},
			function(cards, index, selectable) {
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

function remodelAction(player, game) {
	if (player && game) {

		var turn = player.seat;
		var trashTask = new Task();
		var gainTask = new Task();
		var playItem = selectItem([trashTask, gainTask], [], "play", turn);
		
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

function workshopAction(player, game) {
	if (player && game) {
		
		var turn = player.seat;
		var gainTask = new Task();
		var playItem = selectItem([gainTask], [], "play", turn);
		
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