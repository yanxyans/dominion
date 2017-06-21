import React from 'react';
import MobileTearSheet from './MobileTearSheet';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import GameCardContainer from './GameCardContainer';
import ControlComponent from './ControlComponent';
import GameCard from './GameCard';

const styles = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
		justifyContent: 'center'
  }
};

export default class GameComponent extends React.Component {
	
  render() {
    return (
			<div id='game'>
				<div id='players'>
					{this.props.players.map(function(player, index) {
						return <MobileTearSheet key={index}>
							<List>
								<ListItem primaryText={player.name} secondaryText={
									'deck=' + player.deck +
									('action' in player ? ' action=' + player.action : '') +
									('buy' in player ? ' buy=' + player.buy : '') +
									('coin' in player ? ' coin=' + player.coin : '')
								} onTouchTap={this._reconnectRoom.bind(null, player.seat)} />
							</List>
							{player.control &&
							 <ControlComponent controls={player.control}
																 _sendControl={this._sendControl} />}
							<Divider />
							<GameCardContainer cards={player.hand} type="hand" seat={player.seat} _tapCard={this._tapCard} />
							<Divider />
							<GameCardContainer cards={player.play} type="play" seat={player.seat} _tapCard={this._tapCard} />
							<Divider />
							<GameCardContainer cards={player.discard} type="discard" seat={player.seat} _tapCard={this._tapCard} />
							<Divider />
						</MobileTearSheet>;
					}, this.props)}
					{this.props.piles && Object.keys(this.props.piles).length !== 0 && <MobileTearSheet>
						<div id='piles' style={styles.wrapper}>
							{Object.keys(this.props.piles).map(function(pile, index) {
								var amt = this.piles[pile].length;
								return <GameCard name={pile} amt={amt} key={index}
								                 onTouchTap={this._tapCard.bind(null, ['piles', pile], amt - 1)} />;
							}, this.props)}
						</div>
					</MobileTearSheet>}
					{this.props.trash.length !== 0 && <MobileTearSheet>
						<div id='trash' style={styles.wrapper}>
							{this.props.trash.map(function(tr, index) {
								return <GameCard name={tr} key={index}
								                 onTouchTap={this._tapCard.bind(null, ['trash'], index)} />;
							}, this.props)}
						</div>
					</MobileTearSheet>}
				</div>
			</div>
		);
  }
};