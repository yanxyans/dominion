module.exports = {
    /**
     * Shuffles array in place.
     * @param {Array} a items The array containing the items.
     */
    shuffle: function(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    },
    
    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },
    
    moveCards: function(src, dest, amt) {
        if (src && dest && src.length >= amt) {
            for (var i = 0; i < amt; i++) {
                dest.unshift(src.shift());
            }
        }
    },
    
    getStack: function(stack, mid) {
        var ret = [];
        
        if (stack) {
            var end = stack.length;
            if (mid <= end) {
                for (var i = 0; i < mid; i++) {
                    var card = stack[i];
                    ret.push({
                        name: card.name,
                        coin: card.coin,
                        types: Object.keys(card.types),
                        reactable: card.reactable
                    });
                }
                
                for (var i = mid; i < end; i++) {
                    var card = stack[i];
                    ret.push({});
                }
            }
        }
        return ret;
    },
    
    returnCards: function(src, dest, loc) {
        while (src.length) {
            var card = src.shift();
            dest[card.name][loc].unshift(card);
        }
    },
    
    PHASE: {
        STANDBY: 0,
        ACTION: 1,
        BUY: 2,
        CLEANUP: 3
    },
    
    SUPPLY: {
        PILE: 0,
        WORK: 1
    },
    
    CONSTANT: {
        COPPER_VALUE: 1,
        SILVER_VALUE: 2,
        GOLD_VALUE: 3,
        ESTATE_VALUE: 1,
        DUCHY_VALUE: 3,
        PROVINCE_VALUE: 6,
        CURSE_VALUE: 1,
        MAX_PLAYERS: 4,
        MIN_PLAYERS: 2,
        TURN_DRAW: 5,
        PILE_OUT: 3
    }
    
};