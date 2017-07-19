import React from 'react';

import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import IconName from 'material-ui/svg-icons/action/face';
import IconDisconnect from 'material-ui/svg-icons/alert/warning';
import IconPoints from 'material-ui/svg-icons/action/grade'
import IconOne from 'material-ui/svg-icons/image/looks-one';
import IconTwo from 'material-ui/svg-icons/image/looks-two';
import IconThree from 'material-ui/svg-icons/image/looks-3';
import IconFour from 'material-ui/svg-icons/image/looks-4';

import ControlComponent from './ControlComponent';
import Stack from './Stack';

const styles = {
    icon: {
        fontSize: '20px',
        width: 'auto',
        color: '#fff'
    }
}

function plural(attr) {
    return attr === 1 ? '' : 's';
}

export default class PlayerComponent extends React.Component {
    
    render() {
        var player = this.props.player;
        var source = ['players', player.slot];
        var tooltip = this.props.tooltip;
        var _tap = this.props._tap;

        return (
            <div className={player.isTurn ? 'player' : 'player inactive'}>
                <Paper className='title' zDepth={1} style={{minHeight:'82px',backgroundColor:this.props.color}}>
                    <div className='buttons'>
                        <IconButton tooltip={player.name}
                                    onTouchTap={this.props._recon}>
                            {player.disc ?
                                <IconDisconnect/> :
                                <IconName/>}
                        </IconButton>
                        
                        {player.rank !== -1 &&
                        <IconButton tooltip={player.points + ' point' + plural(player.points)}>
                            {player.rank === 0 && <IconOne/>}
                            {player.rank === 1 && <IconTwo/>}
                            {player.rank === 2 && <IconThree/>}
                            {player.rank === 3 && <IconFour/>}
                        </IconButton>}
                        
                        {player.action !== undefined &&
                        <IconButton tooltip={player.action + ' action' + plural(player.action)}
                                    style={styles.icon}>
                            {player.action + 'A'}
                        </IconButton>}
                        {player.buy !== undefined &&
                        <IconButton tooltip={player.buy + ' buy' + plural(player.buy)}
                                    style={styles.icon}>
                            {player.buy + 'B'}
                        </IconButton>}
                        {player.coin !== undefined &&
                        <IconButton tooltip={player.coin + ' coin' + plural(player.coin)}
                                    style={styles.icon}>
                            {player.coin + 'C'}
                        </IconButton>}
                    </div>
                    
                    {player.control &&
                    <ControlComponent control={player.control}
                                      phase={player.main ? player.phase - 1 : null}
                                      isPlayer={player.isPlayer}
                                      _complete={this.props._complete}/>}
                </Paper>
                
                <div className='content'>
                    <Stack name='discard'
                           cards={player.discard}
                           stacked={true}
                           canToggle={player.discard.length > 1}
                           tooltip={tooltip}
                           _tap={_tap.bind(null, source.concat('discard'))}/>
                    <Stack name='play'
                           cards={player.play}
                           stacked={false}
                           canToggle={false}
                           tooltip={tooltip}
                           _tap={_tap.bind(null, source.concat('play'))}/>
                    <Stack name='deck'
                           cards={player.deck}
                           stacked={true}
                           canToggle={player.deck.length > 1}
                           tooltip={tooltip}
                           _tap={_tap.bind(null, source.concat('deck'))}/>
                    <Stack name='hand'
                           cards={player.hand}
                           stacked={false}
                           canToggle={false}
                           tooltip={tooltip}
                           _tap={_tap.bind(null, source.concat('hand'))}/>
                </div>
            </div>
        );
    }
}