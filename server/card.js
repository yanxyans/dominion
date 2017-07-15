var COPPER_VALUE = 1;
var SILVER_VALUE = 2;
var GOLD_VALUE = 3;
var ESTATE_VALUE = 1;
var DUCHY_VALUE = 3;
var PROVINCE_VALUE = 6;
var CURSE_VALUE = 1;

var Item = require('./item');
var Task = require('./task');

var SUPPLY = require('./util').SUPPLY;

// coin and points factory

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

function mapCards(model, cards, view, type) {
    for (var i = 0; i < model.length; i++) {
        var data = model[i];
        if (cards.indexOf(data) !== -1) {
            view[i][type] = true;
        }
    }
}

function mapView(game, cards, view, type) {
    // map player cards
    for (var i = 0; i < game.players.length; i++) {
        var player = game.players[i];
        var pview = view.players[i];
        if (pview.isPlayer || type === 'selected') {
            mapCards(player.discard.slice(1), cards, pview.discard.slice(1), type);
            mapCards(player.deck, cards, pview.deck, type);
            mapCards(player.hand, cards, pview.hand, type);
        }
        
        mapCards(player.discard.slice(0, 1), cards, pview.discard.slice(0, 1), type);
        mapCards(player.play, cards, pview.play, type);
    }
    
    // map pile cards
    Object.keys(game.supply).forEach(function(name) {
        var work = game.supply[name][SUPPLY.WORK];
        mapCards(work, cards, view.piles[name], type);
    });
    mapCards(game.trash, cards, view.trash, type);
}

function selectTask(type, main, trigger, resolve, controls,
                    getSelectable, selected, player, game) {
    
    var slot = player.slot;
    
    return new Task(slot, type, [new Item(resolve,
        function(ret) {
            ret.players[slot].control = this.controls;
            
            var selectable = getSelectable(selected, player, game);
            mapView(game, selectable, ret, 'selectable');
            mapView(game, selected, ret, 'selected');
            return true;
        },
        function(cards, index) {
            if (cards && index in cards) {
                var card = cards[index];
                
                var selectable = getSelectable(selected, player, game);
                var isSelectable = selectable.indexOf(card);
                var isSelected = selected.indexOf(card);
                
                if (isSelectable !== -1) {
                    // select
                    selected.push(card);
                    return true;
                } else if (isSelected !== -1) {
                    // unselect
                    selected.splice(isSelected, 1);
                    return true;
                }
            }
        }, controls), ...main], trigger);
}

function drawTask(player, amt) {
    var slot = player.slot;
    return new Task(slot, 'draw', [new Item(
        function(task) {
            // resolve
            player.draw(amt);
            return true;
        })], []);
}

function moveSelected(src, selected, dest) {
    for (var i = 0; i < selected.length; i++) {
        var card = selected[i];
        var index = src.indexOf(card);
        
        if (index !== -1) {
            src.splice(index, 1);
            dest.unshift(card);
        }
    }
}

function getSelectable(hand, selectCondition) {
    var selectable = [];
    for (var i = 0; i < hand.length; i++) {
        var card = hand[i];
        if (selectCondition(card)) {
            selectable.push(card);
        }
    }
    return selectable;
}

function cellarAction(player, game) {
    game.action++;
    
    var slot = player.slot;
    var selected = [];
    game.todo.push(new Task(slot, 'play', [new Item(
        function(task) {
            if (player.hand.length > 0) {
                task.todo.push(selectTask('discard', [], [],
                    function(task) {
                        // resolve
                        return player.hand.length === 0;
                    },
                    {
                        Discard: function(player, game) {
                            moveSelected(player.hand, selected, player.discard);
                            
                            this.resolve = function(task) {
                                return true;
                            };
                            return true;
                        }
                    },
                    function(selected, player, game) {
                        // get selectable
                        return getSelectable(player.hand, function(card) {
                            return selected.indexOf(card) === -1;
                        });
                    }, selected, player, game));
            }
            return true;
        }), new Item(
        function(task) {
            if (selected.length > 0) {
                task.todo.push(drawTask(player, selected.length));
            }
            return true;
        })], []));
}

function marketAction(player, game) {
    var slot = player.slot;
    game.todo.push(new Task(slot, 'play', [new Item(
        function(task) {
            task.todo.push(drawTask(player, 1));
            return true;
        })], []));
    game.action++;
    game.buy++;
    game.coin++;
}

function militiaAction(player, game) {
    game.coin += 2;
    
    var slot = player.slot;
    var players = game.players;
    game.todo.push(new Task(slot, 'play', [new Item(
        function(task) {
            task.todo.push(militiaAttack(slot, 
                players.slice(slot + 1).concat(
                players.slice(0, slot)),
                game));
            return true;
        })], []));
}

function militiaAttack(slot, targets, game) {
    return new Task(slot, 'attack', targets.map(function(target) {
        return new Item(function(task) {
            if (target.hand.length > 3) {
                var selected = [];
                task.todo.push(selectTask('discard', [], [],
                    function(task) {
                        return target.hand.length <= 3;
                    },
                    {
                        Discard: function(player, game) {
                            if (target.hand.length - selected.length === 3) {
                                moveSelected(target.hand, selected, target.discard);
                                return true;
                            }
                            return false;
                        }
                    },
                    function(selected, player, game) {
                        if (target.hand.length - selected.length > 3) {
                            return getSelectable(target.hand, function(card) {
                                return selected.indexOf(card) === -1;
                            });
                        }
                        return [];
                    }, selected, target, game));
            }
            return true;
        }, null, null, null, {
            target: target
        });
    }), []);
}

function moatAction(player, game) {
    var slot = player.slot;
    game.todo.push(new Task(slot, 'play', [new Item(
        function(task) {
            task.todo.push(drawTask(player, 2));
            return true;
        })], []));
}

function moatReaction(player, task) {
    var index = task.main.findIndex(function(item) {
        return player === item.target;
    });
    if (index !== -1) {
        // negate attack
        task.main.splice(index, 1);
    }
}

function moatReactable(player, task) {
    return task.type === 'attack' &&
        task.state === 'PREP' &&
        task.main.find(function(item) {
            return player === item.target;
        });
}

function getGainable(supply, gainCondition) {
    var gainable = [];
    Object.keys(supply).forEach(function(name) {
        var work = supply[name][SUPPLY.WORK];
        gainable = gainable.concat(work.filter(gainCondition));
    });
    return gainable;
}

function mineAction(player, game) {
    var slot = player.slot;
    var selected = [];
    var gained = [];
    
    game.todo.push(new Task(slot, 'play', [new Item(
        function(task) {
            if (player.hand.find(function(card) {
                return 'treasure' in card.types;
            })) {
                task.todo.push(selectTask('trash', [], [],
                    function(task) {
                        return !player.hand.find(function(card) {
                            return 'treasure' in card.types;
                        });
                    },
                    {
                        Trash: function(player, game) {
                            moveSelected(player.hand, selected, game.trash);
                            
                            this.resolve = function(task) {
                                return true;
                            };
                            return true;
                        }
                    },
                    function(selected, player, game) {
                        if (selected.length < 1) {
                            return getSelectable(player.hand, function(card) {
                                return 'treasure' in card.types;
                            });
                        }
                        return [];
                    }, selected, player, game));
            }
            return true;
        }), new Item(
        function(task) {
            if (selected.length === 1) {
                var gainCondition = function(supplyCard) {
                    return 'treasure' in supplyCard.types &&
                           supplyCard.coin <= selected[0].coin + 3;
                };
                if (getGainable(game.supply, gainCondition).length > 0) {
                    task.todo.push(selectTask('gain', [], [],
                        function(task) {
                            return getGainable(game.supply, gainCondition).length === 0;
                        },
                        {
                            Gain: function(player, game) {
                                if (gained.length === 1) {
                                    player.gainCard(game.supply, gained[0], 'hand');
                                    
                                    this.resolve = function(task) {
                                        return true;
                                    };
                                    return true;
                                }
                                return false;
                            }
                        },
                        function(selected, player, game) {
                            return selected.length === 0 ?
                                getGainable(game.supply, gainCondition) :
                                [];
                        }, gained, player, game));
                }
            }
            return true;
        })], []));
}

function remodelAction(player, game) {
    var slot = player.slot;
    var selected = [];
    var gained = [];
    
    game.todo.push(new Task(slot, 'play', [new Item(
        function(task) {
            if (player.hand.length > 0) {
                task.todo.push(selectTask('trash', [], [],
                    function(task) {
                        return player.hand.length === 0;
                    },
                    {
                        Trash: function(player, game) {
                            if (selected.length === 1) {
                                moveSelected(player.hand, selected, game.trash);
                                
                                this.resolve = function(task) {
                                    return true;
                                };
                                return true;
                            }
                            return false;
                        }
                    },
                    function(selected, player, game) {
                        if (selected.length < 1) {
                            return getSelectable(player.hand, function(card) {
                                return true;
                            });
                        }
                        return [];
                    }, selected, player, game));
            }
            return true;
        }), new Item(
        function(task) {
            if (selected.length === 1) {
                var gainCondition = function(supplyCard) {
                    return supplyCard.coin <= selected[0].coin + 2;
                };
                if (getGainable(game.supply, gainCondition).length > 0) {
                    task.todo.push(selectTask('gain', [], [],
                        function(task) {
                            return getGainable(game.supply, gainCondition).length === 0;
                        },
                        {
                            Gain: function(player, game) {
                                if (gained.length === 1) {
                                    player.gainCard(game.supply, gained[0], 'discard');
                                    
                                    this.resolve = function(task) {
                                        return true;
                                    };
                                    return true;
                                }
                                return false;
                            }
                        },
                        function(selected, player, game) {
                            return selected.length === 0 ?
                                getGainable(game.supply, gainCondition) :
                                [];
                        }, gained, player, game));
                }
            }
            return true;
        })], []));
}

function smithyAction(player, game) {
    var slot = player.slot;
    game.todo.push(new Task(slot, 'play', [new Item(
        function(task) {
            task.todo.push(drawTask(player, 3));
            return true;
        })], []));
}

function villageAction(player, game) {
    var slot = player.slot;
    game.todo.push(new Task(slot, 'play', [new Item(
        function(task) {
            task.todo.push(drawTask(player, 1));
            return true;
        })], []));
    game.action += 2;
}

function woodcutterAction(player, game) {
    game.buy++;
    game.coin += 2;
}

function workshopAction(player, game) {
    var slot = player.slot;
    var gained = [];
    
    game.todo.push(new Task(slot, 'play', [new Item(
        function(task) {
            var gainCondition = function(supplyCard) {
                return supplyCard.coin <= 4;
            };
            if (getGainable(game.supply, gainCondition).length > 0) {
                task.todo.push(selectTask('gain', [], [],
                    function(task) {
                        return getGainable(game.supply, gainCondition).length === 0;
                    },
                    {
                        Gain: function(player, game) {
                            if (gained.length === 1) {
                                player.gainCard(game.supply, gained[0], 'discard');
                                
                                this.resolve = function(task) {
                                    return true;
                                };
                                return true;
                            }
                            return false;
                        }
                    },
                    function(selected, player, game) {
                        return selected.length === 0 ?
                            getGainable(game.supply, gainCondition) :
                            [];
                    }, gained, player, game));
            }
            return true;
        })], []));
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
                    action: militiaAction,
                    attack: militiaAttack
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
                reactable: moatReactable
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
    
    this.reactable = attributes.reactable ?
        attributes.reactable :
        function(player, item) {
            return false;
        };
}

module.exports = Card;