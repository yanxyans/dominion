
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
	var selected = Object.keys(game.set.kingdom).filter(function(cardName) {
		var cardPile = game.set.kingdom[cardName];
		var card = cardPile.length && cardPile[cardPile.length - 1].selected ? cardPile[cardPile.length - 1] : null;
		return card && card.coinCost <= coinCost && card.potCost <= potCost && types.every(function(val) {
			return this.indexOf(val) > -1;
		}, card.types);
	});
	if (selected.length === 1) {
		var cardName = selected[0];
		game.set.kingdom[cardName][game.set.kingdom[cardName].length - 1].selected = false;
		player.gain(game.set.kingdom, gainDst, cardName, 1);
		if (player.todo.length === 1) {
			player.phase = 1;
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
				player.phase = 4;
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
					player.draw(drawAmt);
					if (player.todo.length === 1) {
						player.phase = 1;
					}
					return true;
				};
				player.todo.push(cellarAction.bind(null, player, game));
				return true;
			}, false);
		case 'market':
			return new actionCard("market", 5, 0, ["action"], function(player) {
				player.draw(1);
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
								pl.phase = 0;
								nextPlayer.phase = nextPlayer.attack ? (nextPlayer.reaction.length ? 5 : 6) : 1;
							}
						};
					}
				});
				
				player.nextPlayer(game);
				player.phase = 0;
				game.players[game.turn].phase = game.players[game.turn].reaction.length ? 5 : 6;
				
				return true;
			}, false);
		case 'mine':
			return new actionCard("mine", 5, 0, ["action"], function(player, game) {
				player.phase = 4;
				var mineAction = function(player, game) {
					var selected = player.hand.filter(function(card) {
						return card.selected && card.types.includes('treasure');
					});
					if (selected.length === 0) {
						if (player.todo.length === 1) {
							player.phase = 1;
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
					player.draw(2);
				} else if (effectType === 'reaction') {
					if (player.attack) {
						player.attack.effect = null;
					}
				}
				return true;
			}, false);
		case 'remodel':
			return new actionCard("remodel", 4, 0, ["action"], function(player, game) {
				player.phase = 4;
				var remodelAction = function(player, game) {
					var selected = player.hand.filter(function(card) {
						return card.selected;
					});
					if (selected.length === 0 && player.hand.length === 0) {
						if (player.todo.length === 1) {
							player.phase = 1;
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
				player.draw(3);
				return true;
			}, false);
		case 'village':
			return new actionCard("village", 3, 0, ["action"], function(player) {
				player.draw(1);
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
			return new actionCard("workshop", 3, 0, ["action"], function(player, game) {
				game.phase = 4;
				player.todo.push(gainAction.bind(null, player, game, 4, 0, [], 'discard'));
				return true;
			}, false);
		default:
			return undefined;
	}
}

module.exports = getCard;