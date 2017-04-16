import React from 'react';
import MobileTearSheet from './MobileTearSheet';
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

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
	
	toggleLast = (e) => {
		var header = document.getElementById(e.target.id);
		var parentID = document.getElementById(e.target.id.replace('_tap', ''));
		header.style.color = header.style.color === 'rgba(0, 0, 0, 0.541176)' ? '#D8E6E7' : 'rgba(0, 0, 0, 0.541176)';

		//get the first inner DIV which contains all the a elements
		var childrenArr = parentID.children;
		for (var i = 0; i < childrenArr.length - 1; i++) {
			var shown = childrenArr[i].style.display;
			childrenArr[i].style.display = shown === 'flex' ? 'none' : 'flex';
		}
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
					{this.props.player.deckSize != null ? <ListItem primaryText={'deck size = ' + this.props.player.deckSize} /> : null}
					{Object.keys(this.props.player.resource).length ? (
					<ListItem primaryText={'action=' + this.props.player.resource.action +
																 ' buy=' + this.props.player.resource.buy +
																 ' coin=' + this.props.player.resource.coin +
																 ' pot=' + this.props.player.resource.potion} />
					) : null}
					<Divider />
					<Subheader id={'discard_tap'} onTouchTap={this.toggleLast}>Discard</Subheader>
					<div id='discard' style={styles.wrapper}>
					{this.props.player.discard.map(function(card, index) {
						return <Chip key={index} style={styles.chip} onTouchTap={this.props._clickCard.bind(null, 'discard', index)} backgroundColor={card.sel ? "#9DC3C1" : (index === this.props.player.discard.length - 1 ? "#D8E6E7" : null)}><Avatar size={32} onMouseEnter={this.props._help.bind(null, card.name)} onMouseLeave={this.props._help.bind(null, '')}>?</Avatar>{card.name}</Chip>;
					}, this)}
					</div>
					<Divider />
					<Subheader id={'in_play_tap'} onTouchTap={this.toggleLast}>Played</Subheader>
					<div id='in_play' style={styles.wrapper}>
					{this.props.player.inPlay.map(function(card, index) {
						return <Chip key={index} style={styles.chip} onTouchTap={this.props._clickCard.bind(null, 'in_play', index)} backgroundColor={card.sel ? "#9DC3C1" : (index === this.props.player.inPlay.length - 1 ? "#D8E6E7" : null)}><Avatar size={32} onMouseEnter={this.props._help.bind(null, card.name)} onMouseLeave={this.props._help.bind(null, '')}>?</Avatar>{card.name}</Chip>;
					}, this)}
					</div>
					<Divider />
					<Subheader id={'in_hand_tap'} onTouchTap={this.toggleLast}>Hand</Subheader>
					<div id='in_hand' style={styles.wrapper}>
					{this.props.player.hand.map(function(card, index) {
						return <Chip key={index} style={styles.chip} onTouchTap={this.props._clickCard.bind(null, 'in_hand', index)} backgroundColor={card.sel ? "#9DC3C1" : (index === this.props.player.hand.length - 1 ? "#D8E6E7" : null)}><Avatar size={32} onMouseEnter={this.props._help.bind(null, card.name)} onMouseLeave={this.props._help.bind(null, '')}>?</Avatar>{card.name}</Chip>;
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
										 <ListItem primaryText={'name = ' + player.name} onTouchTap={this.props._rec.bind(null, player.spot)}/>
										 {player.deckSize != null ? <ListItem primaryText={'deck size = ' + player.deckSize} /> : null}
										 {Object.keys(player.resource).length ? (
										 <ListItem primaryText={'action=' + player.resource.action +
																						' buy=' + player.resource.buy +
																						' coin=' + player.resource.coin +
																						' pot=' + player.resource.potion} />
										 ) : null}
										 <Divider />
								 		 <Subheader id={'discard' + index + '_tap'} onTouchTap={this.toggleLast}>Discard</Subheader>
										 <div id={'discard' + index} style={styles.wrapper}>
										 {player.discardTop.map(function(card, index) {
											 return <Chip key={index} style={styles.chip} backgroundColor={card.sel ? "#9DC3C1" : (index === player.discardTop.length - 1 ? "#D8E6E7" : null)}><Avatar size={32} onMouseEnter={this.props._help.bind(null, card.name)} onMouseLeave={this.props._help.bind(null, '')}>?</Avatar>{card.name}</Chip>;
										 }, this)}
										 </div>
										 <Divider />
										 <Subheader id={'in_play' + index + '_tap'} onTouchTap={this.toggleLast}>Played</Subheader>
										 <div id={'in_play' + index} style={styles.wrapper}>
										 {player.inPlay.map(function(card, index) {
											 return <Chip key={index} style={styles.chip} backgroundColor={card.sel ? "#9DC3C1" : (index === player.inPlay.length - 1 ? "#D8E6E7" : null)}><Avatar size={32} onMouseEnter={this.props._help.bind(null, card.name)} onMouseLeave={this.props._help.bind(null, '')}>?</Avatar>{card.name}</Chip>;
										 }, this)}
										 </div>
										 <Divider />
										 <Subheader id={'in_hand' + index + '_tap'} onTouchTap={this.toggleLast}>Hand</Subheader>
										 <div id={'in_hand' + index} style={styles.wrapper}>
										 {player.hand.map(function(card, index) {
											 return <Chip key={index} style={styles.chip} backgroundColor={card.sel ? "#9DC3C1" : (index === player.hand.length - 1 ? "#D8E6E7" : null)}>{card.name}</Chip>;
										 })}
										</div>
									 </List>
								 </MobileTearSheet>;
				}, this)}
			</div>
		) : null;
		
		let PileTable = Object.keys(this.props.piles).length ? (
			<MobileTearSheet>
				<Subheader>Piles</Subheader>
				<div id='piles' style={styles.wrapper}>
				{this.props.piles.map(function(pile, index) {
					return <Chip key={index}
											 style={styles.chip}
											 onTouchTap={this.props._clickCard.bind(null, 'buy', pile.name)}
											 backgroundColor={pile.sel ? "#9DC3C1" : null}>
											 <Avatar size={32} onMouseEnter={this.props._help.bind(null, pile.name)} onMouseLeave={this.props._help.bind(null, '')}>?</Avatar>{pile.name} {pile.amt}
								 </Chip>;
				}, this)}
				</div>
				<Divider />
				<Subheader>Trash</Subheader>
				<div id='trash' style={styles.wrapper}>
				{this.props.trash.map(function(trash_card, index) {
					return <Chip key={index}
											 style={styles.chip}><Avatar size={32} onMouseEnter={this.props._help.bind(null, trash_card)} onMouseLeave={this.props._help.bind(null, '')}>?</Avatar>{trash_card}</Chip>;
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