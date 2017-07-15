function Item(resolve, view, apply, controls, attributes) {
    this.resolve = resolve;
    
    this.view = view ? view : function(ret) {
        // do nothing
    };
    this.apply = apply ? apply : function(cards, index) {
        return true;
    };
    
    this.controls = controls ? Object.keys(controls) : [];
    
    this.controls.forEach(function(control) {
        this[control] = controls[control];
    }, this);
    
    if (attributes) {
        Object.keys(attributes).forEach(function(attr) {
            this[attr] = attributes[attr];
        }, this);
    }
}

module.exports = Item;