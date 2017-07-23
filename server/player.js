var shuffle = require('./util').shuffle;
var moveCards = require('./util').moveCards;
var getStack = require('./util').getStack;
var retCards = require('./util').returnCards;

var PHASE = require('./util').PHASE;
var SUPPLY = require('./util').SUPPLY;

function Player(user) {
    this.id = user.id;
    this.name = user.name;
    
    // card store
    this.deck = [];
    this.discard = [];
    this.hand = [];
    this.play = [];
    
    // standby phase
    this.phase = PHASE.STANDBY;
    
    // allocate at game start
    this.slot = -1;
    
    this.bought = false;
    
    // allocate at game end
    this.points = 0;
    this.rank = -1;
}

Player.prototype.retrievePlayerState = function(isPlayer, isTurn, isEnd) {
    return {
        name: this.name,
        deck: getStack(this.deck, isEnd ? this.deck.length : 0),
        discard: getStack(this.discard, isPlayer || isEnd ?
            this.discard.length :
            Math.min(this.discard.length, 1)),
        hand: getStack(this.hand, isPlayer || isEnd ? this.hand.length : 0),
        play: getStack(this.play, this.play.length),
        phase: this.phase,
        slot: this.slot,
        points: this.points,
        rank: this.rank,
        disc: this.id === null,
        isPlayer: isPlayer,
        isTurn: isTurn || isEnd,
        bought: this.bought
    };
};

Player.prototype.init = function() {
    this.phase = PHASE.STANDBY;
    
    this.slot = -1;
    
    this.points = 0;
    this.rank = -1;
};

Player.prototype.setSlot = function(slot) {
    this.slot = slot;
};

Player.prototype.draw = function(amt) {
    var deckAmt = this.deck.length;
    var drawAmt = Math.min(amt, deckAmt);
    
    moveCards(this.deck, this.hand, drawAmt);
    
    if (drawAmt < amt && this.discard.length) {
        shuffle(this.discard);
        // place shuffled cards on top of deck
        [this.deck, this.discard] = [this.discard, this.deck];
        this.draw(amt - drawAmt);
    }
};

Player.prototype.cleanUp = function() {
    moveCards(this.hand, this.discard, this.hand.length);
    moveCards(this.play, this.discard, this.play.length);
    
    // standby phase
    this.phase = PHASE.STANDBY;
    
    this.bought = false;
};

Player.prototype.hasReactable = function(task) {
    var len = this.hand.length;
    for (var i = 0; i < len; i++) {
        var card = this.hand[i];
        if (card.reactable(this, task)) {
            return true;
        }
    }
    
    return false;
};

Player.prototype.applyPoints = function(game) {
    this.applyPointsStack(this.hand, game);
    this.applyPointsStack(this.play, game);
    this.applyPointsStack(this.deck, game);
    this.applyPointsStack(this.discard, game);
};

Player.prototype.applyPointsStack = function(stack, game) {
    var len = stack.length;
    for (var i = 0; i < len; i++) {
        var card = stack[i];
        var types = card.types;
        (types.victory && types.victory(this, game)) ||
        (types.curse && types.curse(this, game));
    }
};

Player.prototype.returnCards = function(supply, pile) {
    retCards(this.deck, supply, pile);
    retCards(this.discard, supply, pile);
    retCards(this.hand, supply, pile);
    retCards(this.play, supply, pile);
};

Player.prototype.playCard = function(card, playType, game) {
    var index = this.hand.indexOf(card);
    if (index !== -1) {
        this.hand.splice(index, 1);
        this.play.unshift(card);
        
        card.types[playType](this, game);
        game.callback('_game_event', this.getName() + ' plays ' + card.name);
        game.advanceTask(game.todo);
    }
};

Player.prototype.gainCard = function(supply, card, dest) {
    var name = card.name;
    var work = supply[name][SUPPLY.WORK];
    var index = work.indexOf(card);
    if (index !== -1) {
        work.splice(index, 1);
        this[dest].unshift(card);
    }
};

Player.prototype.getName = function() {
    return this.name + ' (' + (this.slot + 1) + ')';
};

module.exports = Player;