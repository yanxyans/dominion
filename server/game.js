var Player = require('./player');
var Item = require('./item');
var Task = require('./task');

var getRandomInt = require('./util').getRandomInt;
var moveCards = require('./util').moveCards;
var getStack = require('./util').getStack;
var retCards = require('./util').returnCards;

var PHASE = require('./util').PHASE;
var SUPPLY = require('./util').SUPPLY;
var CONSTANT = require('./util').CONSTANT;

function Game(startDeck, supply, callback) {
    this.state = 'INIT';
    this.turn = -1;
    
    this.startDeck = startDeck;
    this.players = [];
    this.initResources();
    
    this.supply = supply;
    this.trash = [];
    
    this.callback = callback;
}

Game.prototype.initResources = function() {
    this.action = 0;
    this.buy = 0;
    this.coin = 0;
    this.todo = [];
};

Game.prototype.resetResources = function() {
    this.action = 0;
    this.buy = 0;
    this.coin = 0;
};

Game.prototype.giveResources = function(player) {
    this.action = 1;
    this.buy = 1;
    this.coin = 0;
    
    player.phase = PHASE.ACTION;
};

Game.prototype.addPlayer = function(user) {
    if (!user || this.state !== 'INIT') {
        return false;
    }
    
    if (this.players.length >= CONSTANT.MAX_PLAYERS) {
        return false;
    }
    
    this.players.push(new Player(user));
    this.alignWorkSupply();
    return true;
};

Game.prototype.alignWorkSupply = function() {
    var supply = this.supply;
    var numPlayers = this.players.length;
    Object.keys(supply).forEach(function(name) {
        var arr = supply[name];
        var work = arr[SUPPLY.WORK];
        var pile = arr[SUPPLY.PILE];
        if (numPlayers < 2) {
            moveCards(work, pile, work.length);
        } else if (arr[numPlayers] > work.length) {
            moveCards(pile, work, arr[numPlayers] - work.length);
        } else if (arr[numPlayers] < work.length) {
            moveCards(work, pile, work.length - arr[numPlayers]);
        }
        // else already aligned
    });
};

Game.prototype.removePlayer = function(user) {
    if (!user) {
        return false;
    }
    
    var slot = this.getPlayIndex(user.id);
    if (slot === -1) {
        // player was not found
        return false;
    }
    
    if (this.state !== 'MAIN') {
        // free player slot
        var player = this.players.splice(slot, 1)[0];
        player.returnCards(this.supply, SUPPLY.PILE);
        
        if (this.state === 'INIT') {
            this.alignWorkSupply();
        } else if (this.state === 'END' && this.players.length === 0) {
            this.restartGame();
        }
    } else {
        // game in progress, wait on reconnect
        var player = this.players[slot];
        
        player.id = null;
        player.name = 'reconnect';
    }
    return true;
};

Game.prototype.getPlayIndex = function(id) {
    return this.players.map(function(player) {
        return player.id;
    }).indexOf(id);
};

Game.prototype.reconnect = function(user, slot) {
    if (!user || this.getPlayIndex(user.id) !== -1) {
        return false;
    }
    
    return this.takePlayerSlot(user, slot);
};

Game.prototype.takePlayerSlot = function(user, slot) {
    if (!user || !(slot in this.players)) {
        return false;
    }
    
    var playerSlot = this.players[slot];
    if (playerSlot.id !== null) {
        // player slot is occupied
        return false;
    }
    playerSlot.id = user.id;
    playerSlot.name = user.name;
    return true;
};

Game.prototype.retrieveGameState = function(id) {
    var task = this.nextTask();
    
    var state = this.state;
    var turn = task ? task.nextTurn() : this.turn;
    var players = this.players.map(function(player) {
        return player.retrievePlayerState(id === player.id,
                                          turn === player.slot,
                                          state === 'END');
    });
    
    var supply = this.supply;
    var work = {};
    Object.keys(supply).forEach(function(name) {
        var stack = supply[name][SUPPLY.WORK];
        work[name] = getStack(stack, stack.length);
    });
    
    var ret = {
        players: players,
        piles: work,
        trash: getStack(this.trash, this.trash.length),
        action: this.action,
        buy: this.buy,
        coin: this.coin
    };
    
    task ? task.nextItem().view(ret) : this.view(ret);
    return ret;
};

Game.prototype.view = function(ret) {
    var players = ret.players;
    var len = players.length;
    for (var i = 0; i < len; i++) {
        var player = players[i];
        
        if (this.state === 'INIT' &&
            player.isPlayer &&
            len >= CONSTANT.MIN_PLAYERS) {
            player.control = ['Start'];
        } else if (this.state === 'MAIN' &&
                   player.isTurn) {
            player.control = ['Action', 'Buy', 'Cleanup'];
            player.action = ret.action;
            player.buy = ret.buy;
            player.coin = ret.coin;
            player.main = true;
            
            if (player.isPlayer) {
                for (var j = 0; j < player.hand.length; j++) {
                    var card = player.hand[j];
                    
                    if (player.phase === PHASE.ACTION &&
                        card.types.indexOf('action') !== -1 &&
                        this.action) {
                        card.selectable = true;
                    } else if (player.phase === PHASE.BUY &&
                               card.types.indexOf('treasure') !== -1 &&
                               !player.bought) {
                        card.selectable = true;
                    }
                }
            }
            
            var coin = this.coin;
            if (player.phase === PHASE.BUY && this.buy) {
                Object.keys(ret.piles).forEach(function(key) {
                    var pile = ret.piles[key];
                    
                    for (var j = 0; j < pile.length; j++) {
                        var card = pile[j];
                        if (card.coin <= coin) {
                            card.selectable = true;
                        }
                    }
                });
            }
        } else if (this.state === 'END' &&
                   player.isPlayer) {
            player.control = ['Restart'];
        }

    }
};

Game.prototype.start = function(user) {
    if (!user || this.getPlayIndex(user.id) === -1 || this.state !== 'INIT') {
        return false;
    }
    
    var len = this.players.length;
    if (len < CONSTANT.MIN_PLAYERS) {
        return false;
    }
    
    // flag game as in progress
    this.state = 'MAIN';
    
    // get starting deck
    var startDeck = this.startDeck;
    var supply = this.supply;
    
    for (var i = 0; i < len; i++) {
        var player = this.players[i];
        
        Object.keys(startDeck).forEach(function(name) {
            moveCards(supply[name][SUPPLY.WORK],
                      player.discard,
                      startDeck[name]);
        });
        player.draw(CONSTANT.TURN_DRAW);
        
        player.setSlot(i);
    }
    
    // randomly choose first player
    var turnOne = getRandomInt(0, len);
    var playerOne = this.players[turnOne];
    
    this.giveResources(playerOne);
    this.turn = turnOne;
    
    return true;
};

Game.prototype.restart = function(user) {
    if (!user || this.getPlayIndex(user.id) === -1 || this.state !== 'END') {
        return false;
    }
    this.restartGame();
    return true;
};

Game.prototype.restartGame = function() {
    this.state = 'INIT';
    this.turn = -1;
    
    this.initResources();
    
    this.returnAll();
    this.alignWorkSupply();
};

Game.prototype.returnAll = function() {
    var len = this.players.length;
    for (var i = len - 1; i > -1; i--) {
        var player = this.players[i];
        player.returnCards(this.supply, SUPPLY.PILE);
        if (player.id === null) {
            this.players.splice(i, 1);
        } else {
            player.init();
        }
    }
    
    retCards(this.trash, this.supply, SUPPLY.PILE);
};

Game.prototype.setPhase = function(user, phase) {
    if (!user || this.state !== 'MAIN') {
        return false;
    }
    
    var playIndex = this.getPlayIndex(user.id);
    if (this.turn !== playIndex ||
        this.todo.length ||
        phase > PHASE.CLEANUP) {
        return false;
    }
    
    var player = this.players[playIndex];
    if (phase <= player.phase) {
        return false;
    }
    
    player.phase = phase;
    if (phase === PHASE.CLEANUP) {
        // cleanup sequence
        player.cleanUp();
        player.draw(CONSTANT.TURN_DRAW);
        
        var supply = this.supply;
        if (supply.province[SUPPLY.WORK].length === 0 ||
            Object.keys(supply).filter(function(name) {
                return supply[name][SUPPLY.WORK].length === 0;
            }).length >= CONSTANT.PILE_OUT) {
            
            this.endGame();
        } else {
            var turnNext = (this.turn + 1) % this.players.length;
            var playerNext = this.players[turnNext];
            
            this.giveResources(playerNext);
            this.turn = turnNext;
        }
        
    }
    
    return true;
};

Game.prototype.endGame = function() {
    if (this.state === 'MAIN') {
        this.state = 'END';
        
        var len = this.players.length;
        for (var i = 0; i < len; i++) {
            this.players[i].applyPoints(this);
        }
        
        this.players.slice().sort(function(pOne, pTwo) {
            return pTwo.points - pOne.points;
        }).forEach(function(player, index) {
            player.rank = index;
        });
        
        this.resetResources();
    }
};

Game.prototype.tapCard = function(user, src, index) {
    if (!user || this.state !== 'MAIN') {
        return false;
    }
    
    var playIndex = this.getPlayIndex(user.id);
    var task = this.nextTask();
    
    if (task && task.nextTurn() !== playIndex) {
        return false;
    } else if (!task && this.turn !== playIndex) {
        return false;
    }
    
    var cards = this.getCards(src);
    if (!cards) {
        return false;
    }
    
    var player = this.players[playIndex];
    return (task && this.handleTask(task, cards, index)) ||
        ((cards === player.hand) && this.handlePlay(player, cards, index)) ||
        ((this.getPileName(cards) in this.supply) && this.handleBuy(player, cards, index));
};

Game.prototype.getCards = function(src) {
    if (src && src.length) {
        var type = src.shift();
        if (type === 'players') {
            return this.getPlayerCards(src);
        } else if (type === 'piles') {
            return this.getPileCards(src);
        } else if (type === 'trash' && !src.length) {
            return this.trash;
        }
    }
    
    return null;
};

Game.prototype.getPlayerCards = function(src) {
    if (src && src.length === 2) {
        var player = src[0];
        var cards = src[1];
        if (player in this.players &&
           (cards === 'hand' ||
            cards === 'discard' ||
            cards === 'play' ||
            cards === 'deck')) {
            return this.players[player][cards];
        }
    }
    
    return null;
};

Game.prototype.getPileCards = function(src) {
    if (src && src.length === 1) {
        var name = src[0];
        if (name in this.supply) {
            return this.supply[name][SUPPLY.WORK];
        }
    }
    
    return null;
};

Game.prototype.getPileName = function(pile) {
    var supply = this.supply;
    return Object.keys(supply).find(function(name) {
        return supply[name][SUPPLY.WORK] === pile;
    });
};

Game.prototype.handleTask = function(task, cards, index) {
    var item = task.nextItem();
    if (item.apply(cards, index)) {
        this.advanceTask(this.todo);
        return true;
    }
    
    return false;
};

Game.prototype.handlePlay = function(player, cards, index) {
    if (index in cards) {
        var card = cards[index];
        
        if (player.phase === PHASE.ACTION &&
            'action' in card.types &&
            this.action) {
            this.action--;
            player.playCard(card, 'action', this);
            return true;
        } else if ('treasure' in card.types &&
                   player.phase === PHASE.BUY &&
                   !player.bought) {
            player.playCard(card, 'treasure', this);
            return true;
        }
    }
    
    return false;
};

Game.prototype.handleBuy = function(player, cards, index) {
    if (index in cards) {
        var card = cards[index];
        
        if (player.phase === PHASE.BUY &&
            card.coin <= this.coin &&
            this.buy) {
            
            // pay for card
            this.coin -= card.coin;
            this.buy--;
            
            if (!player.bought) {
                player.bought = true;
            }
            
            // gain card
            var supply = this.supply;
            this.todo.push(new Task(player.slot, 'gain', [new Item(
                function(task) {
                    player.gainCard(supply, card, 'discard');
                    return true;
                })], []));
            
            this.advanceTask(this.todo);
            return true;
        }
    }
    
    return false;
};

Game.prototype.completeItem = function(user, control) {
    if (!user || this.state !== 'MAIN') {
        return false;
    }
    
    var task = this.nextTask();
    if (!task) {
        return false;
    }
    
    var playIndex = this.getPlayIndex(user.id);
    var item = task.nextItem();
    if (task.nextTurn() !== playIndex ||
        item.controls.indexOf(control) === -1) {
        return false;
    }
    
    var player = this.players[playIndex];
    if (item[control](player, this)) {
        this.advanceTask(this.todo);
        return true;
    }
    
    return false;
};

Game.prototype.nextTask = function() {
    var todo = this.todo;
    
    if (todo.length) {
        var task = todo[0];
        while (task.todo.length) {
            task = task.todo[0];
        }
        return task;
    }
    
    return null;
};

Game.prototype.advanceTask = function(todo) {
    while (todo.length) {
        var task = todo[0];
        if (!this.advanceItem(task)) {
            return false;
        }
        
        todo.shift();
    }
    
    return true;
};

Game.prototype.advanceItem = function(task) {
    while (true) {
        // return false on unresolved children task
        if (!this.advanceTask(task.todo)) {
            return false;
        }
        
        switch (task.state) {
            case 'PREP':
                this.getReactions(task);
                
                if (!this.advanceReactions(task)) {
                    return false;
                }
            case 'MAIN':
                task.state = 'MAIN';
                
                if (task.main.length) {
                    if (!task.main[0].resolve(task)) {
                        return false;
                    }
                    
                    task.main.shift();
                    break;
                }
            case 'POST':
                task.state = 'POST';
                this.getReactions(task);
                
                if (!this.advanceReactions(task)) {
                    return false;
                }
                
                if (task.trigger.length) {
                    var item = task.trigger.shift();
                    item.resolve(task);
                    break;
                }
                
                return true;
        }
    }
};

Game.prototype.getReactions = function(task) {
    if (!task.react.length) {
        var slot = task.slot;
        var len = this.players.length;
        var callback = this.callback;
        
        for (let i = 0; i < len; i++) {
            let turn = (slot + i) % len;
            let player = this.players[turn];
            
            task.react.push(new Item(
                function(task) {
                    return !player.hasReactable(task);
                },
                function(ret) {
                    var retp = ret.players[turn];
                    retp.control = this.controls;
                    
                    if (retp.isPlayer) {
                        var hand = retp.hand;
                        for (var j = 0; j < hand.length; j++) {
                            var card = hand[j];
                            if (card.reactable(player, task)) {
                                card.selectable = true;
                            }
                        }
                    }
                },
                function(cards, index) {
                    // use reaction card
                    if (cards === player.hand && index in cards) {
                        var card = cards[index];
                        if (card.reactable(player, task)) {
                            card.types.reaction(player, task);
                            
                            callback('_reaction_event',
                                player.name +
                                ' reveals a ' +
                                card.name +
                                ' from hand!');
                                
                            return true;
                        }
                    }
                    return false;
                },
                {
                    Finish: function() {
                        this.resolve = function(task) {
                            return true;
                        };
                        return true;
                    }
                },
                {
                    slot: turn
                }));
        }
    }
};

Game.prototype.advanceReactions = function(task) {
    while (task.react.length) {
        var reaction = task.react[0];
        if (!reaction.resolve(task)) {
            return false;
        }
        
        task.react.shift();
    }
    return true;
};

module.exports = Game;