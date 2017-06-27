import React from 'react';

import IconButton from 'material-ui/IconButton';
import ActionAdd from 'material-ui/svg-icons/content/add';
import ActionRemove from 'material-ui/svg-icons/content/remove';

export default class Stack extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            open: props.open
        };
    }
    
    _handleToggle = () => {
        this.setState({open: !this.state.open});
    }
    
    _getIndex = (index, isLast, selected) => {
        var margin = this.state.open ? null : {marginRight:(isLast ? '0px':'-50px')};
        var isSelected = selected ? {opacity:0.3} : null;
        
        return Object.assign(
            {},
            {zIndex:index, maxHeight:'100px', transition:'.3s'},
            margin,
            isSelected
        );
    }
    
    render() {
        var data = this.props.data;
        var display = data.slice(this.state.open ? null : -5);
        var len = display.length;
        
        var click = data.length ? this.props._tapCard.bind(null, data.length - 1) : null;
        
        return (
            <div id='wrap'>
                <IconButton onTouchTap={this._handleToggle}
                            tooltip={this.props.tooltip}
                            style={{zIndex:1000}}>
                    {this.state.open ? <ActionRemove/> : <ActionAdd/>}
                </IconButton>
                <div onTouchTap={this.state.open ? null : click} id='stack'>
                    {display.map(function(item, index) {
                        var name = item.name;
                        var source = '/asset/cards/' + (name ? name : 'back') + '.jpg';
                        return <div key={index} className='hvr-grow-shadow'>
                                <img 
                                    src={source}
                                    style={this._getIndex(index, index === len - 1, item.selected)}
                                    onTouchTap={this.state.open ? this.props._tapCard.bind(null, index) : null}
                                    
                                    onMouseOver={this.props._handleMouseOver.bind(this, name)}
                                    onMouseOut={this.props._handleMouseOut}/>
                               </div>
                    }, this)}
                </div>
            </div>
        );
    }
}