import React from 'react';
import ReactTooltip from 'react-tooltip';

import Paper from 'material-ui/Paper';
import Subheader from 'material-ui/Subheader';

import IconButton from 'material-ui/IconButton';
import IconAdd from 'material-ui/svg-icons/content/add';
import IconRemove from 'material-ui/svg-icons/content/remove';

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

export default class Stack extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            stacked: props.stacked
        }
    }
    
    _handleToggle = () => {
        this.setState({stacked: !this.state.stacked});
    }
    
    render() {
        var stacked = this.state.stacked;
        var cards = !stacked ?
            this.props.cards :
            this.props.cards.slice(0, 5);
        var tooltip = this.props.tooltip;
        var _tap = this.props._tap;
        
        return (
            <Paper zDepth={1} className='wrap'>
                {this.props.canToggle &&
                <IconButton onTouchTap={this._handleToggle}>
                    {stacked ? <IconRemove/> : <IconAdd/>}
                </IconButton>}
                <div className='stack'>
                    {cards.map(function(card, index) {
                        var name = card.name;
                        var source = '/asset/cards/' + (name ? name : 'back') + '.jpg';
                        card.source = source;
                        
                        const guid = guidGenerator();
                        card.guid = guid;
                        var ind = 0 - index;
                        return <img key={index}
                                    src={source}
                                    onTouchTap={_tap.bind(null, index)}
                                    data-for={guid}
                                    data-tip=''
                                    className={!stacked || index === 0 ? 'card' : 'card stacked'}
                                    style={{zIndex:ind}}/>;
                    })}
                    {cards.map(function(card, index) {
                        return <ReactTooltip key={index}
                                             id={card.guid}>
                                    {tooltip &&
                                    <img src={card.source}
                                         className='tooltip'/>}
                               </ReactTooltip>;
                    })}
                </div>
            </Paper>
        );
    }
}