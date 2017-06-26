import React from 'react';
import ControlComponent from './ControlComponent';
import FullWidthSection from './FullWidthSection';
import BoardComponent from './BoardComponent';
import Paper from 'material-ui/Paper';
import PlayerComponent from './PlayerComponent';

export default class GameComponent extends React.Component {
    render() {
        return (
            <div>
                <BoardComponent piles={this.props.piles}
                                trash={this.props.trash}
                                _tapCard={this.props._tapCard}/>
                <FullWidthSection id='players'>
                    {this.props.players.map(function(player, index) {
                        var slot = player.seat;
                        return <PlayerComponent key={index}
                                                player={player}
                                                _reconRoom={this._reconRoom.bind(null, slot)}
                                                _sendControl={this._sendControl}
                                                _tapCard={this._tapCard}/>;
                    }, this.props)}
                </FullWidthSection>
            </div>
        );
    }
}