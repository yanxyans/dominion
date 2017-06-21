var shuffle = require('./util').shuffle;
var findOne = require('./util').findOne;
var moveCards = require('./util').moveCards;

var ACTION_PHASE = 1;
var BUY_PHASE = 2;

function Player(user) {
	this.id = user.id;
	this.name = user.name;
	
	// game variables
	
	// card storage
	this.deck = [];
	this.discard = [];
	this.hand = [];
	this.play = [];
	
	// start in standby phase
	this.phase = 0;
	
	// used for state management, set at game start
	this.seat = -1;
	
	// buy status
	this.bought = false;
	
	this.points = 0;
}

Player.prototype.retrievePlayerState = function(id) {
	var visible = id === this.id;
	return {
		name: this.name,
		deck: this.deck.length,
		discard: visible ?
			this.discard.map(this.getCardName.bind(null, true)) :
			this.discard.slice(this.discard.length - 1).map(this.getCardName.bind(null, true)),
		hand: this.hand.map(this.getCardName.bind(null, visible)),
		play: this.play.map(this.getCardName.bind(null, true)),
		phase: this.phase,
		seat: this.seat
	};
};

Player.prototype.getCardName = function(visible, card) {
	return visible && card ? card.name : "";
};

Player.prototype.init = function(seat) {
	this.emptyCards();
	
	this.phase = 0;
	
	this.seat = seat;
	
	this.bought = false;
	
	this.points = 0;
};

Player.prototype.emptyCards = function() {
	this.deck = [];
	this.discard = [];
	this.hand = [];
	this.play = [];
};

Player.prototype.draw = function(amt) {
	var deck_amt = this.deck.length;
	var draw_amt = Math.min(amt, deck_amt);
	
	moveCards(this.deck, this.hand, draw_amt);
	
	if (draw_amt < amt && this.discard.length) {
		shuffle(this.discard);
		// place shuffled cards on top of deck
		[this.deck, this.discard] = [this.discard, this.deck];
		this.draw(amt - draw_amt);
	}
};

Player.prototype.cleanUp = function() {
	moveCards(this.hand, this.discard, this.hand.length);
	moveCards(this.play, this.discard, this.play.length);
	
	// standby phase
	this.phase = 0;
	
	this.bought = false;
};

Player.prototype.canPlayAction = function(card) {
	return card && this.phase === ACTION_PHASE;
};

Player.prototype.canPlayTreasure = function(card) {
	return card && this.phase === BUY_PHASE && !this.bought;
};

Player.prototype.canBuy = function(card) {
	return card && this.phase === BUY_PHASE;
};

Player.prototype.canReact = function(item) {
	var len = this.hand.length;
	for (var i = 0; i < len; i++) {
		var card = this.hand[i];
		if (card.canReact && card.canReact(this, item)) {
			return true;
		}
	}
	
	return false;
};

Player.prototype.countScore = function() {
	this.getScoreIn(this.hand);
	this.getScoreIn(this.play);
	this.getScoreIn(this.deck);
	this.getScoreIn(this.discard);

	return {
		name: this.name,
		score: this.points
	};
};

Player.prototype.getScoreIn = function(stack) {
	for (var i = 0; i < stack.length; i++) {
		var card = stack[i];
		if ('victory' in card.types) {
			card.types.victory(this);
		} else if ('curse' in card.types) {
			card.types.curse(this);
		}
	}
};

module.exports = Player;