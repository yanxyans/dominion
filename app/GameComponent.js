import React from 'react';
import MobileTearSheet from './MobileTearSheet';
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import GameCard from './GameCard';

const styles = {
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
		justifyContent: 'center'
  },
	head_off: {
		color: 'rgba(0, 0, 0, 0.541176)',
		cursor: 'pointer'
	},
	head_on: {
		color: '#285943',
		cursor: 'pointer'
	}
};

export default class Container extends React.Component {
	state = {
		in_hand: false,
		in_play: false,
		discard: false,
		in_hand0: false,
		in_play0: false,
		discard0: false,
		in_hand1: false,
		in_play1: false,
		discard1: false,
		in_hand2: false,
		in_play2: false,
		discard2: false,
		in_hand3: false,
		in_play3: false,
		discard3: false,
		piles: false,
		trash: false
	};
	
	handleAction = () => {
		this.props.action();
	};
	
	toggleLast = (e) => {
		var t = e.target.id.replace('_tap', '');
		var newState = {};
		newState[t] = !this.state[t];
		this.setState(newState);
	};
	
	getColor = (sel, types) => {
		if (types.includes('attack')) {
			return sel ? '#b92f66' : '#B85B80';
		} else if (types.includes('reaction')) {
			return sel ? '#37b1d1' : '#7BBCCD';
		} else if (types.includes('treasure')) {
			return sel ? '#f1ad23' : '#F0C060';
		} else if (types.includes('victory')) {
			return sel ? '#11545a' : '#19828B';
		} else if (types.includes('curse')) {
			return sel ? '#902b99' : '#915996';
		} else {
			return sel ? '#8b8787' : null;
		}
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
					<Subheader id={'in_hand_tap'} onTouchTap={this.toggleLast} style={this.state.in_hand ? styles.head_on : styles.head_off}>hand</Subheader>
					<div id='in_hand' style={styles.wrapper}>
					{this.props.player.hand.map(function(card, index) {
						return (!this.state.in_hand || (index === this.props.player.hand.length - 1)) &&
							<GameCard key={index}
												index={index}
												type='in_hand'
												name={card.name}
												sel={card.sel}
												_clickCard={this.props._clickCard}
												_help={this.props._help} />;
					}, this)}
					</div>
					<Divider />
					<Subheader id={'in_play_tap'} onTouchTap={this.toggleLast} style={this.state.in_play ? styles.head_on : styles.head_off}>played</Subheader>
					<div id='in_play' style={styles.wrapper}>
					{this.props.player.inPlay.map(function(card, index) {
						return (!this.state.in_play || (index === this.props.player.inPlay.length - 1)) &&
							<GameCard key={index}
												index={index}
												type='in_play'
												name={card.name}
												sel={card.sel}
												_clickCard={this.props._clickCard}
												_help={this.props._help} />;
					}, this)}
					</div>
					<Divider />
					<Subheader id={'discard_tap'} onTouchTap={this.toggleLast} style={this.state.discard ? styles.head_on : styles.head_off}>discard</Subheader>
					<div id='discard' style={styles.wrapper}>
					{this.props.player.discard.map(function(card, index) {
						return (!this.state.discard || (index === this.props.player.discard.length - 1)) &&
							<GameCard key={index}
												index={index}
												type='discard'
												name={card.name}
												sel={card.sel}
												_clickCard={this.props._clickCard}
												_help={this.props._help} />;
					}, this)}
					</div>
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
										 <Subheader id={'in_hand' + index + '_tap'} onTouchTap={this.toggleLast} style={this.state['in_hand' + index] ? styles.head_on : styles.head_off}>hand</Subheader>
										 <div id={'in_hand' + index} style={styles.wrapper}>
										 {player.hand.map(function(card, handIndex) {
											 return (!this.state['in_hand' + index] || (handIndex === player.hand.length - 1)) &&
											   <GameCard key={handIndex}
																	 index={handIndex}
																	 type='in_hand_other'
																	 name={card.name}
																	 sel={card.sel}
																	 _clickCard={this.props._clickCard}
																	 _help={this.props._help} />;
										 }, this)}
										 </div>
										 <Divider />
										 <Subheader id={'in_play' + index + '_tap'} onTouchTap={this.toggleLast} style={this.state['in_play' + index] ? styles.head_on : styles.head_off}>played</Subheader>
										 <div id={'in_play' + index} style={styles.wrapper}>
										 {player.inPlay.map(function(card, playIndex) {
											 return (!this.state['in_play' + index] || (playIndex === player.hand.length - 1)) &&
											   <GameCard key={playIndex}
																	 index={playIndex}
																	 type='in_play_other'
																	 name={card.name}
																	 sel={card.sel}
																	 _clickCard={this.props._clickCard}
																	 _help={this.props._help} />;
										 }, this)}
										 </div>
										 <Divider />
										 <Subheader id={'discard' + index + '_tap'} onTouchTap={this.toggleLast} style={this.state['discard' + index] ? styles.head_on : styles.head_off}>discard</Subheader>
										 <div id={'discard' + index} style={styles.wrapper}>
										 {player.discardTop.map(function(card, discardIndex) {
											 return (!this.state['discard' + index] || (discardIndex === player.discardTop.length - 1)) &&
											   <GameCard key={discardIndex}
																	 index={discardIndex}
																	 type='discard_other'
																	 name={card.name}
																	 sel={card.sel}
																	 _clickCard={this.props._clickCard}
																	 _help={this.props._help} />;
										 }, this)}
										 </div>
										 <Divider />
									 </List>
								 </MobileTearSheet>;
				}, this)}
			</div>
		) : null;
		
		let PileTable = Object.keys(this.props.piles).length ? (
			<MobileTearSheet id='sheet'>
				<Subheader id='piles_tap' onTouchTap={this.toggleLast} style={this.state.piles ? styles.head_on : styles.head_off}>piles</Subheader>
				<div id='piles' style={styles.wrapper}>
				{this.props.piles.map(function(pile, index) {
					return (!this.state.piles || (index === this.props.piles.length - 1)) &&
						<GameCard key={index}
										  index={pile.name}
										  type='buy'
										  name={pile.name}
										  sel={pile.sel}
										  _clickCard={this.props._clickCard}
										  _help={this.props._help}
											amt={pile.amt} />;
				}, this)}
				</div>
				<Divider />
				<Subheader id='trash_tap' onTouchTap={this.toggleLast} style={this.state.trash ? styles.head_on : styles.head_off}>trash</Subheader>
				<div id='trash' style={styles.wrapper}>
				{this.props.trash.map(function(trash_card, index) {
					return (!this.state.trash || (index === this.props.trash.length - 1)) &&
						<GameCard key={index}
										  index={index}
										  type='trash'
										  name={trash_card.name}
										  sel={trash_card.sel}
										  _clickCard={this.props._clickCard}
										  _help={this.props._help} />;
				}, this)}
				</div>
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