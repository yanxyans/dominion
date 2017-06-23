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
						player.hand.splice(index, 1);
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
		
		var attacker = player.seat;
		var len = game.players.length;
		for (let i = 1; i < len; i++) {
			let attacked = game.players[(attacker + i) % len];
			
			let attackTask = new Task();
			let attackItem = new Item([attackTask], [], "attack", attacker);
			
			game.todo.push(attackItem);
		}
	}
}

function militiaAttack(player) {
	var discardTask = new Task();
	var turn = player.seat;
	return selectItem([discardTask], [], "discard", turn);
}

function moatAction(player, game) {
	if (player) {
		player.draw(2);
	}
}

function moatReaction(player, item) {
	if (item) {
		item.target = null;
	}
}

function mineAction(player, game) {
	if (player && game) {
		
		var turn = player.seat;
		var trashTask = new Task();
		var gainTask = new Task();
		var playItem = selectItem([trashTask, gainTask], [], "play", turn);
		
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
		var target = item.target;
		return type === "attack" && state === "PRE" && target === player;
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