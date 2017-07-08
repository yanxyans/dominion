import React from 'react';

import BoardComponent from './BoardComponent';
import PlayersComponent from './PlayersComponent';

import FullWidthSection from './FullWidthSection';

export default class GameComponent extends React.Component {
    
    render() {
        return (
            <FullWidthSection id='game'>
                <PlayersComponent players={this.props.players}
                                  gameState={this.props.gameState}
                                  _reconRoom={this.props._reconRoom}
                                  _sendControl={this.props._sendControl}
                                  _tapCard={this.props._tapCard}
                                  help={this.props.help}/>
                {this.props.gameState !== 'INIT' &&
                <BoardComponent piles={this.props.piles}
                                trash={this.props.trash}
                                _tapCard={this.props._tapCard}
                                help={this.props.help}/>}
            </FullWidthSection>
        );
    }
}