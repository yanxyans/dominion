import React from 'react';

import BoardComponent from './BoardComponent';
import PlayersComponent from './PlayersComponent';
import InfoComponent from './InfoComponent';

import FullWidthSection from './FullWidthSection';

export default class GameComponent extends React.Component {
    state = {
        card: null
    }
    
    _handleMouseOver = (card) => {
        this.setState({card: card});
    }
    _handleMouseOut = () => {
        this.setState({card: null});
    }
    
    render() {
        return (
            <FullWidthSection id='game'>
                <PlayersComponent players={this.props.players}
                                  gameState={this.props.gameState}
                                  _reconRoom={this.props._reconRoom}
                                  _sendControl={this.props._sendControl}
                                  _tapCard={this.props._tapCard}
                                  _handleMouseOver={this._handleMouseOver}
                                  _handleMouseOut={this._handleMouseOut}/>
                <BoardComponent piles={this.props.piles}
                                trash={this.props.trash}
                                _tapCard={this.props._tapCard}
                                _handleMouseOver={this._handleMouseOver}
                                _handleMouseOut={this._handleMouseOut}/>
                <InfoComponent help={this.props.help}
                               card={this.state.card}/>
            </FullWidthSection>
        );
    }
}