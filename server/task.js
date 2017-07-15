function Task(slot, type, main, trigger) {
    this.slot = slot;
    this.type = type;
    
    this.main = main;
    this.trigger = trigger;
    this.react = [];
    
    this.state = 'PREP';
    this.todo = [];
}

Task.prototype.nextTurn = function() {
    if (this.state === 'PREP' && this.react.length) {
        return this.react[0].slot;
    } else if (this.state === 'MAIN' && this.main.length) {
        return this.slot;
    } else if (this.state === 'POST') {
        if (this.react.length) {
            return this.react[0].slot;
        } else if (this.trigger.length) {
            return this.slot;
        }
    }
    
    return -1;
};

Task.prototype.nextItem = function() {
    if (this.state === 'PREP' && this.react.length) {
        return this.react[0];
    } else if (this.state === 'MAIN' && this.main.length) {
        return this.main[0];
    } else if (this.state === 'POST') {
        if (this.react.length) {
            return this.react[0];
        } else if (this.trigger.length) {
            return this.trigger[0];
        }
    }
    
    return null;
};  

module.exports = Task;