import React from 'react';
import MobileTearSheet from './MobileTearSheet';
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';

export default class Container extends React.Component {
	
	handleAction = () => {
		var args = [];
		this.props.action(args);
	};
	
	handleDiscard = (selected) => {
		console.log(selected.map(function(item) {
			return this.props.player.discard[item];
		}, this));
	};
	
	handlePlay = (selected) => {
		console.log(selected.map(function(item) {
			return this.props.player.inPlay[item];
		}, this));
	};
	
	handleHand = (selected) => {
		console.log(selected.map(function(item) {
			return this.props.player.hand[item];
		}, this));
	};
	
  render() {
		let ActionList = this.props.action ? (
			<div id='action'>
				<Divider />
				<List>
					<ListItem primaryText={this.props.actionName} onTouchTap={this.handleAction} />
				</List>
			</div>
		) : null;
		let PlayerTable = this.props.player ? (
			<MobileTearSheet>
				<List>
					<ListItem primaryText={'name = ' + this.props.player.name} />
					<ListItem primaryText={'deck size = ' + this.props.player.deckSize} />
					<ListItem primaryText={'action = ' + this.props.player.resource.action} />
					<ListItem primaryText={'buy = ' + this.props.player.resource.buy} />
					<ListItem primaryText={'coin = ' + this.props.player.resource.coin} />
					<ListItem primaryText={'potion = ' + this.props.player.resource.potion} />
				</List>
				<Divider />
				<Table onRowSelection={this.handleDiscard}>
					<TableBody>
						{this.props.player.discard.map(function(card, index) {
							return <TableRow key={index}>
									     <TableRowColumn>{card}</TableRowColumn>
								     </TableRow>;
						})}
					</TableBody>
				</Table>
				<Divider inset={true} />
				<Table onRowSelection={this.handlePlay}>
					<TableBody>
						{this.props.player.inPlay.map(function(card, index) {
							return <TableRow key={index}>
									     <TableRowColumn>{card}</TableRowColumn>
								     </TableRow>;
						})}
					</TableBody>
				</Table>
				<Divider inset={true} />
				<Table onRowSelection={this.handleHand}>
					<TableBody>
						{this.props.player.hand.map(function(card, index) {
							return <TableRow key={index}>
										   <TableRowColumn>{card}</TableRowColumn>
										 </TableRow>;
						})}
					</TableBody>
				</Table>
				{ActionList}
			</MobileTearSheet>
		) : null;
		
		let PlayerTables = this.props.players ? (
			<div id='players'>
				{this.props.players.map(function(player, index) {
					return <MobileTearSheet key={index}>
								   <List>
										 <ListItem primaryText={'name = ' + player.name} />
										 <ListItem primaryText={'deck size = ' + player.deckSize} />
										 <ListItem primaryText={'discard top = ' + player.discardTop ?
										   player.discardTop[0] : null} />
										 <ListItem primaryText={'hand size = ' + player.handSize} />
										 <ListItem primaryText={'action = ' + player.resource.action} />
										 <ListItem primaryText={'buy = ' + player.resource.buy} />
										 <ListItem primaryText={'coin = ' + player.resource.coin} />
										 <ListItem primaryText={'potion = ' + player.resource.potion} />
									 </List>
									 <Divider />
									 <Table>
									   <TableBody>
										   {player.inPlay.map(function(card, index) {
											   return <TableRow key={index}>
														      <TableRowColumn>{card}</TableRowColumn>
													      </TableRow>;
											 })}
									   </TableBody>
									 </Table>
								 </MobileTearSheet>;
				})}
			</div>
		) : null;
		
		let PileTable = Object.keys(this.props.piles).length > 0 ? (
			<MobileTearSheet>
				<Table>
					<TableBody>
						{Object.keys(this.props.piles).map(function(pile, index) {
							var amt = this.props.piles[pile];
							return <TableRow key={index}>
										   <TableRowColumn>{pile}</TableRowColumn>
										   <TableRowColumn>{amt}</TableRowColumn>
										 </TableRow>;
						}, this)}
					</TableBody>
				</Table>
			</MobileTearSheet>
		) : null;
		let UserTable = Object.keys(this.props.users).length > 0 ? (
			<MobileTearSheet>
				<Table>
					<TableBody>
						{Object.keys(this.props.users).map(function(key, index) {
							var user = this.props.users[key];
							return <TableRow key={index}>
										   <TableRowColumn>{user.name}</TableRowColumn>
											 <TableRowColumn>{user.type ? "player" : "spec"}</TableRowColumn>
										 </TableRow>;
						}, this)}
					</TableBody>
				</Table>
			</MobileTearSheet>
		) : null;
    return (
			<div id='game'>
				{PlayerTable}
				{PlayerTables}
				{PileTable}
				{UserTable}
			</div>
		)
  }
};