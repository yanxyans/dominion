import React from 'react';

import ControlComponent from './ControlComponent';
import Stack from './Stack';

import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';

import IconName from 'material-ui/svg-icons/action/face';
import IconDisconnect from 'material-ui/svg-icons/alert/warning';

import IconPoints from 'material-ui/svg-icons/action/grade'

import IconOne from 'material-ui/svg-icons/image/looks-one';
import IconTwo from 'material-ui/svg-icons/image/looks-two';
import IconThree from 'material-ui/svg-icons/image/looks-3';
import IconFour from 'material-ui/svg-icons/image/looks-4';

import { amberA700, white } from 'material-ui/styles/colors';

const styles = {
    icon: {
        fontSize: '20px',
        color: white,
        width: 'auto'
    }
}

export default class PlayerComponent extends React.Component {
    
    render() {
        
        var player = this.props.player;
        var source = ['players', player.slot];
        var visible = player.isPlayer;
        
        var hasContent = this.props.hasContent;
        
        var tap = this.props._tapCard;
        var over = this.props._handleMouseOver;
        var out = this.props._handleMouseOut;
        
        var help = this.props.help && player.isTurn;

        return (
            <div className={player.isTurn ? 'player' : 'player inactive'}>
                <Paper className='title' zDepth={1} style={{minHeight:'82px'}}>
                    <div className='buttons'>
                        <IconButton tooltip={player.name}
                                    onTouchTap={this.props._reconRoom}>
                            {player.disc ?
                                <IconDisconnect/> :
                                <IconName color={visible ? amberA700 : null}/>}
                        </IconButton>
                        
                        {player.rank !== -1 &&
                        <IconButton tooltip={player.points + (player.points === 1 ? ' point' : ' points')}>
                            {player.rank === 0 && <IconOne/>}
                            {player.rank === 1 && <IconTwo/>}
                            {player.rank === 2 && <IconThree/>}
                            {player.rank === 3 && <IconFour/>}
                        </IconButton>}
                        
                        {player.action !== undefined &&
                        <IconButton tooltip={player.action + (player.action === 1 ? ' action' : ' actions')}
                                    style={styles.icon}>
                            {player.action + 'A'}
                        </IconButton>}
                        {player.buy !== undefined &&
                        <IconButton tooltip={player.buy + (player.buy === 1 ? ' buy' : ' buys')}
                                    style={styles.icon}>
                            {player.buy + 'B'}
                        </IconButton>}
                        {player.coin !== undefined &&
                        <IconButton tooltip={player.coin + (player.coin === 1 ? ' coin' : ' coins')}
                                    style={styles.icon}>
                            {player.coin + 'C'}
                        </IconButton>}
                    </div>
                    
                    {player.control &&
                    <ControlComponent control={player.control}
                                      phase={player.main ? player.phase - 1 : null}
                                      visible={visible}
                                      _sendControl={this.props._sendControl}/>}
                </Paper>
                
                <div className='content'>
                    <Stack data={player.discard}
                           tooltip='discard'
                           _tapCard={tap.bind(null, source.concat('discard'))}
                           open={false}
                           show={help}/>
                    <Stack data={player.play}
                           tooltip='play'
                           _tapCard={tap.bind(null, source.concat('play'))}
                           open={true}
                           show={help}
                           alwaysOpen={true}/>

                    <Stack data={player.deck}
                           tooltip='deck'
                           _tapCard={tap.bind(null, source.concat('deck'))}
                           open={false}
                           show={help}/>
                    <Stack data={player.hand}
                           tooltip='hand'
                           _tapCard={tap.bind(null, source.concat('hand'))}
                           open={true}
                           show={help}
                           alwaysOpen={true}/>
                </div>
            </div>
        );
    }
}