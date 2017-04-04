import React from 'react';
import MobileTearSheet from './MobileTearSheet';
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Chip from 'material-ui/Chip';

const styles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
		justifyContent: 'center'
  },
};

export default class Container extends React.Component {
	
	handleAction = () => {
		this.props.action();
	};
	
  render() {
		let ActionList = this.props.action ? (
			<div id='action'>
				<Divider />
				<ListItem primaryText={this.props.actionName} onTouchTap={this.handleAction} />
			</div>
		) : null;
		let PlayerTable = this.props.player ? (
			<MobileTearSheet>
				<List>
					<ListItem primaryText={'name = ' + this.props.player.name} />
					<ListItem primaryText={'deck size = ' + this.props.player.deckSize} />
					<ListItem primaryText={'a=' + this.props.player.resource.action +
																 ' b=' + this.props.player.resource.buy +
																 ' c=' + this.props.player.resource.coin +
																 ' p=' + this.props.player.resource.potion} />
					<Divider />
					<Subheader>Discard</Subheader>
					<div id='discard' style={styles.wrapper}>
					{this.props.player.discard.map(function(card, index) {
						return <Chip key={index} style={styles.chip} onTouchTap={this.props._clickCard.bind(null, 'discard', index)}>{card}</Chip>;
					}, this)}
					</div>
					<Divider />
					<Subheader>Played</Subheader>
					<div id='in_play' style={styles.wrapper}>
					{this.props.player.inPlay.map(function(card, index) {
						return <Chip key={index} style={styles.chip} onTouchTap={this.props._clickCard.bind(null, 'in_play', index)}>{card}</Chip>;
					}, this)}
					</div>
					<Divider />
					<Subheader>Hand</Subheader>
					<div id='in_hand' style={styles.wrapper}>
					{this.props.player.hand.map(function(card, index) {
						return <Chip key={index} style={styles.chip} onTouchTap={this.props._clickCard.bind(null, 'in_hand', index)}>{card}</Chip>;
					}, this)}
					</div>
					{ActionList}
				</List>
			</MobileTearSheet>
		) : null;
		let PlayerTables = PlayerTable || this.props.players ? (
			<div id='players'>
				{PlayerTable}
				{this.props.players.map(function(player, index) {
					return <MobileTearSheet key={index}>
								   <List>
										 <ListItem primaryText={'name = ' + player.name} />
										 <ListItem primaryText={'deck size = ' + player.deckSize} />
										 <ListItem primaryText={'discard top = ' + (player.discardTop[0] ? player.discardTop[0] : 'none')} />
										 <ListItem primaryText={'hand size = ' + player.handSize} />
										 <ListItem primaryText={'a=' + player.resource.action +
																						' b=' + player.resource.buy +
																						' c=' + player.resource.coin +
																						' p=' + player.resource.potion} />
										 <Divider />
										 <Subheader>Played</Subheader>
										 <div id='in_play' style={styles.wrapper}>
										 {player.inPlay.map(function(card, index) {
											 return <Chip key={index} style={styles.chip}>{card}</Chip>;
										 })}
										 </div>
									 </List>
								 </MobileTearSheet>;
				})}
			</div>
		) : null;
		
		let PileTable = Object.keys(this.props.piles).length ? (
			<MobileTearSheet>
				<div id='piles' style={styles.wrapper}>
				{Object.keys(this.props.piles).map(function(pile, index) {
					var amt = this.props.piles[pile];
					return <Chip key={index}
											 style={styles.chip}
											 onTouchTap={this.props._clickCard.bind(null, 'buy', pile)}>{pile} {amt}</Chip>;
				}, this)}
				</div>
			</MobileTearSheet>
		) : null;
		let UserTable = Object.keys(this.props.users).length ? (
			<MobileTearSheet>
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