import React from 'react';

import Paper from 'material-ui/Paper';
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
        var isStacked = !this.state.open && !isLast ?
            {marginRight:'-50px'} :
            null;
        var isSelected = selected ?
            {opacity:0.35} :
            null;
        
        return Object.assign(
            {},
            {zIndex:index, maxHeight:'100px', transition:'.3s'},
            isStacked,
            isSelected
        );
    }
    
    render() {
        var data = this.props.data;
        var display = this.state.open ? data : data.slice(-5);
        
        var len = display.length;
        var start = this.state.open ? 0 : data.length - len;
        
        var tap = this.props._tapCard;
        var over = this.props._handleMouseOver;
        var out = this.props._handleMouseOut;
        
        return (
            <Paper className='wrap' zDepth={2}>
                <IconButton onTouchTap={this._handleToggle}
                            tooltip={this.props.tooltip}
                            style={{zIndex:1000}}>
                    {this.state.open ? <ActionRemove/> : <ActionAdd/>}
                </IconButton>
                <div className='stack'>
                    {display.map(function(item, index) {
                        var name = item.name;
                        var source = '/asset/cards/' + (name ? name : 'back') + '.jpg';
                        var isLast = index === len - 1;
                        
                        return <div key={index}
                                    className='hvr-grow-shadow'>
                                   <img src={source}
                                        style={this(index, isLast, item.selected)}
                                        onTouchTap={tap.bind(null, start + index)}
                                        onMouseOver={over.bind(null, name)}
                                        onMouseOut={out}/>
                               </div>
                    }, this._getIndex)}
                </div>
            </Paper>
        );
    }
}