import React from 'react';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import Stack from './Stack';
import Control from './Control';

export default class Player extends React.Component {

    render() {
        var player = this.props.player;
        var source = ['players', player.slot];
        var tooltip = this.props.tooltip;
        var _complete = this.props._complete;
        var _tap = this.props._tap;
        
        return (
            <div className='player'>
                <Paper className={player.isTurn ? 'title' : 'title inactive'}
                       zDepth={1}
                       style={{backgroundColor:this.props.color, padding:'5px'}}>
                    <RaisedButton label={player.name}
                                  primary={!player.disc}
                                  onTouchTap={this.props._recon}/>
                        
                    {player.rank !== -1 &&
                    <RaisedButton label={player.points + ' vp'}
                                  primary={true}/>}
                    
                    {player.control &&
                    <Control player={player}
                             _complete={_complete}/>}
                </Paper>
                
                {!this.props.hideContent &&
                <div className='content'>
                    <div className='wrap'>
                        <Stack name='discard'
                               cards={player.discard}
                               stacked={!this.props.allCards}
                               tooltip={tooltip}
                               came={' ' + (this.props.allCards ? 'full' : 'min')}
                               _tap={_tap.bind(null, source.concat('discard'))}/>
                        <Stack name='play'
                               cards={player.play}
                               stacked={false}
                               tooltip={tooltip}
                               came={' ' + (this.props.allCards ? 'full' : 'min')}
                               _tap={_tap.bind(null, source.concat('play'))}/>
                    </div>
                    <div className='wrap'>
                        <Stack name='deck'
                               cards={player.deck}
                               stacked={!this.props.allCards}
                               tooltip={tooltip}
                               came={' ' + (this.props.allCards ? 'full' : 'min')}
                               _tap={_tap.bind(null, source.concat('deck'))}/>
                        <Stack name='hand'
                               cards={player.hand}
                               stacked={false}
                               tooltip={tooltip}
                               came={' ' + (this.props.allCards ? 'full' : 'min')}
                               _tap={_tap.bind(null, source.concat('hand'))}/>
                    </div>
                </div>}
            </div>
        );
    }
}