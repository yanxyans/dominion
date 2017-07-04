import React from 'react';

import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';

import IconAdd from 'material-ui/svg-icons/content/add';
import IconRemove from 'material-ui/svg-icons/content/remove';


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
            {marginRight:'-55px'} :
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
        var display = this.state.open ? data : data.slice(0, 5);
        
        var size = data.length;
        var len = display.length;
        
        var tap = this.props._tapCard;
        var over = this.props._handleMouseOver;
        var out = this.props._handleMouseOut;
        
        return (
            <Paper className='wrap' zDepth={1}>
                <IconButton onTouchTap={this._handleToggle}
                            tooltip={this.props.tooltip + ' (' + size + ')'}
                            style={{zIndex:1000}}>
                    {this.state.open ? <IconRemove/> : <IconAdd/>}
                </IconButton>
                <div className='stack'>
                    {display.map(function(item, index) {
                        var name = item.name;
                        var source = '/asset/cards/' + (name ? name : 'back') + '.jpg';
                        var isLast = index === 0;
                        
                        return <img key={index}
                                    src={source}
                                    className='hvr-grow-shadow'
                                    style={this(len - 1 - index, isLast, item.selected)}
                                    onTouchTap={tap.bind(null, index)}
                                    onMouseOver={over.bind(null, name)}
                                    onMouseOut={out}/>;
                    }, this._getIndex)}
                </div>
            </Paper>
        );
    }
}