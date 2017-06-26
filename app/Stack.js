import React from 'react';

import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';

import ActionAdd from 'material-ui/svg-icons/content/add';
import ActionRemove from 'material-ui/svg-icons/content/remove';

const styles = {
    stacked: {
        maxHeight: '100px',
        marginRight: '-50px'
    },
    unstacked: {
        maxHeight: '100px'
    }
};

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
    
    render() {
        var data = this.props.data;
        var click = data.length ? this.props._tapCard.bind(null, data.length - 1) : null;
        
        return (
            <div id='wrap'>
                <IconButton onTouchTap={this._handleToggle}>
                    {this.state.open ? <ActionRemove/> : <ActionAdd/>}
                </IconButton>
                <div onTouchTap={this.state.open ? null : click} id='stack'>
                    {this.props.data.slice(this.state.open ? null : -5).map(function(item, index) {
                        return <img key={index}
                                    src={'/asset/cards/' + (item.name ? item.name : 'back') + '.jpg'}
                                    style={{zIndex:index}}
                                    style={this.state.open ? styles.unstacked : styles.stacked}
                                    onTouchTap={this.state.open ? this.props._tapCard.bind(null, index) : null}/>;
                    }, this)}
                </div>
            </div>
        );
    }
}