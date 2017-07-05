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
    
    /**
     * @description determine if an array contains one or more items from another array.
     * @param {array} haystack the array to search.
     * @param {array} arr the array providing items to check for in the haystack.
     * @return {boolean} true|false if haystack contains at least one item from arr.
     */
    findOne: function(haystack, arr) {
        return arr.some(function (v) {
            return haystack.indexOf(v) >= 0;
        });
    },
    
    moveCards: function(src, dest, amt) {
        if (src && dest && src.length >= amt) {
            for (var i = 0; i < amt; i++) {
                dest.unshift(src.shift());
            }
        }
    }
    
};