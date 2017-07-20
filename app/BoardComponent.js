import React from 'react';

import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';

import IconButton from 'material-ui/IconButton';
import IconSort from 'material-ui/svg-icons/content/sort';
import IconClear from 'material-ui/svg-icons/content/clear';

import Stack from './Stack';

export default class BoardComponent extends React.Component {
    state = {
        sorted: false
    }
    
    _toggle = () => {
        this.setState({sorted: !this.state.sorted});
    }
    
    render() {
        var supply = this.props.supply;
        var keys = Object.keys(supply);
        if (this.state.sorted) {
            keys.sort(function(keyA, keyB) {
                var lenA = supply[keyA].length;
                var lenB = supply[keyB].length;
                if (!lenA || !lenB) {
                    return lenB - lenA;
                }
                return supply[keyA][0].coin - supply[keyB][0].coin;
            });
        }
        
        var trash = this.props.trash;
        var tooltip = this.props.tooltip;
        var _tap = this.props._tap;
        
        return (
            <Paper id='board' zDepth={2}>
                <AppBar title='supply'
                        showMenuIconButton={false}
                        iconElementRight={this.state.sorted ?
                            <IconButton><IconClear/></IconButton> :
                            <IconButton><IconSort/></IconButton>}
                        onRightIconButtonTouchTap={this._toggle}
                        style={{zIndex:998}}/>
                <div className='content'>
                    {keys.map(function(name, index) {
                        var cards = supply[name];
                        return <Stack key={index}
                                      name={name}
                                      cards={cards}
                                      stacked={true}
                                      tooltip={tooltip}
                                      _tap={_tap.bind(null, ['piles', name])}/>;
                    })}
                    {trash &&
                    <Stack name='trash'
                           cards={trash}
                           stacked={false}
                           tooltip={tooltip}
                            _tap={_tap.bind(null, ['trash'])}/>}
                </div>
            </Paper>
        );
    }
}