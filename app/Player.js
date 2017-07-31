import React from 'react';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';

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
            <div className={player.isTurn ? 'player' : 'player inactive'}>
                <Toolbar className='title'
                         style={{backgroundColor:this.props.color, zIndex:1}}>
                    <ToolbarGroup>
                        <ToolbarTitle text={player.name}
                                      onTouchTap={this.props._recon}
                                      style={{color:player.disc ? '#e0e0e0' : '#303030'}}/>
                    </ToolbarGroup>
                    <ToolbarGroup>
                        {player.rank !== -1 &&
                        <RaisedButton label={player.points + ' vp'}/>}
                        
                        {player.control &&
                        <Control player={player}
                                 _complete={_complete}/>}
                    </ToolbarGroup>
                </Toolbar>
                
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