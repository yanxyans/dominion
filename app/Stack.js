import React from 'react';
import ReactTooltip from 'react-tooltip';

import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+'-'+S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
}

export default class Stack extends React.Component {
    
    render() {
        var stacked = this.props.stacked;
        var cards = !stacked ?
            this.props.cards :
            this.props.cards.slice(0, 5);
        
        var tooltip = this.props.tooltip;
        var came = this.props.came;
        
        var _tap = this.props._tap;
        
        return (
            <Paper zDepth={1} className={'stack' + (came ? came : '')}>
                <div className='desc'> {this.props.name} </div>
                {cards.map(function(card, index) {
                    var name = card.name;
                    var source = '/asset/cards/' + (name ? name : 'back') + '.jpg';
                    card.source = source;
                    
                    const guid = guidGenerator();
                    card.guid = guid;
                    
                    var ind = 600 - index;
                    var onTop = !stacked || index === 0;
                    var name = onTop ? 'card' : 'card stacked';
                    if (onTop && card.selectable) {
                        name += ' selectable';
                    } else if (card.selected) {
                        name += ' selected';
                    }
                    
                    return <img key={index}
                                src={source}
                                onTouchTap={onTop ? _tap.bind(null, index) : null}
                                data-for={guid}
                                data-tip=''
                                className={name}
                                style={{zIndex: stacked ? ind : null}}/>;
                })}
                {cards.map(function(card, index) {
                    return <ReactTooltip key={index}
                                         id={card.guid}>
                                {tooltip &&
                                <img src={card.source}
                                     className='tooltip'/>}
                           </ReactTooltip>;
                })}
            </Paper>
        );
    }
}