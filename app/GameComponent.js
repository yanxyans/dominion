import React from 'react';
import MobileTearSheet from './MobileTearSheet';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import GameCardContainer from './GameCardContainer';

export default class Container extends React.Component {
	
	handleAction = () => {
		this.props.action();
	};
	
  render() {
		let ActionList = this.props.action ? (
			<div id='action'>
				<ListItem primaryText={this.props.actionName} onTouchTap={this.handleAction} />
			</div>
		) : null;
		let PlayerTable = this.props.player ? (
			<MobileTearSheet isTurn={this.props.player.turn ? 'solid 5px #285943' : 'solid 1px #d9d9d9'} id='sheet'>
				<List>
					<ListItem primaryText={'name=' + this.props.player.name} />
					{this.props.player.deckSize != null ? <ListItem primaryText={'deck_size=' + this.props.player.deckSize} /> : null}
					{Object.keys(this.props.player.resource).length ? (
					<ListItem primaryText={'action=' + this.props.player.resource.action +
																 ' buy=' + this.props.player.resource.buy +
																 ' coin=' + this.props.player.resource.coin +
																 ' pot=' + this.props.player.resource.potion} />
					) : null}
					{ActionList}
					<Divider />
					<GameCardContainer cards={this.props.player.hand} type='in_hand' _clickCard={this.props._clickCard} _help={this.props._help} />
					<Divider />
					<GameCardContainer cards={this.props.player.inPlay} type='in_play' _clickCard={this.props._clickCard} _help={this.props._help} />
					<Divider />
					<GameCardContainer cards={this.props.player.discard} type='discard' _clickCard={this.props._clickCard} _help={this.props._help} />
					<Divider />
				</List>
			</MobileTearSheet>
		) : null;
		let PlayerTables = PlayerTable || this.props.players ? (
			<div id='players'>
				{PlayerTable}
				{this.props.players.map(function(player, index) {
					return <MobileTearSheet key={index} isTurn={player.turn ? 'solid 5px #285943' : 'solid 1px #d9d9d9'} id='sheet'>
								   <List>
										 <ListItem primaryText={'name=' + player.name} onTouchTap={this.props._rec.bind(null, player.spot)}/>
										 {player.deckSize != null ? <ListItem primaryText={'deck_size=' + player.deckSize} /> : null}
										 {Object.keys(player.resource).length ? (
										 <ListItem primaryText={'action=' + player.resource.action +
																						' buy=' + player.resource.buy +
																						' coin=' + player.resource.coin +
																						' pot=' + player.resource.potion} />
										 ) : null}
										 <Divider />
										 <GameCardContainer cards={player.hand} type='in_hand_other' _clickCard={this.props._clickCard} _help={this.props._help} />
										 <Divider />
										 <GameCardContainer cards={player.inPlay} type='in_play_other' _clickCard={this.props._clickCard} _help={this.props._help} />
										 <Divider />
										 <GameCardContainer cards={player.discardTop} type='discard_other' _clickCard={this.props._clickCard} _help={this.props._help} />
										 <Divider />
									 </List>
								 </MobileTearSheet>;
				}, this)}
			</div>
		) : null;
		
		let PileTable = Object.keys(this.props.piles).length ? (
			<MobileTearSheet id='sheet'>
				<GameCardContainer cards={this.props.piles} type='buy' _clickCard={this.props._clickCard} _help={this.props._help} />
				<Divider />
				<GameCardContainer cards={this.props.trash} type='trash' _clickCard={this.props._clickCard} _help={this.props._help} />
			</MobileTearSheet>
		) : null;
		let UserTable = Object.keys(this.props.users).length ? (
			<MobileTearSheet id='sheet'>
				<List>
				{Object.keys(this.props.users).map(function(key, index) {
					var user = this.props.users[key];
					return <ListItem primaryText={user.name} secondaryText={user.type ? "player" : "spec"} key={index} />;
				}, this)}
				</List>
			</MobileTearSheet>
		) : null;
		let GameTable = PileTable || UserTable ? (
			<div id='gameBoard'>
				{PileTable}
				{UserTable}
			</div>
		) : null;
    return (
			<div id='game'>
				{PlayerTables}
				{GameTable}
			</div>
		)
  }
};