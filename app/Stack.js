import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
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
    
    _getIndex = (index, isLast) => {
        var margin = this.state.open ? {margin:'5px'} : {marginRight:(isLast ? '0px':'-60px')};
        return Object.assign(
            {},
            {zIndex:index, maxHeight:'100px'},
            margin
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
                            tooltip={this.props.tooltip}>
                    {this.state.open ? <ActionRemove/> : <ActionAdd/>}
                </IconButton>
                <div onTouchTap={this.state.open ? null : click} id='stack'>
                    {display.map(function(item, index) {
                        return <img key={index}
                                    src={'/asset/cards/' + (item.name ? item.name : 'back') + '.jpg'}
                                    style={this._getIndex(index, index === len - 1)}
                                    onTouchTap={this.state.open ? this.props._tapCard.bind(null, index) : null}/>;
                    }, this)}
                </div>
            </div>
        );
    }
}