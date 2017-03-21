import React from 'react';
import MobileTearSheet from './MobileTearSheet';
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import FlatButton from 'material-ui/RaisedButton';

export default class Container extends React.Component {
	handleBoardSelection = (selectedRows) => {
		console.log("selected rows are " + selectedRows.toString());
	};
	
	handleAction = () => {
		var args = [];
		this.props.action(args);
	};
	
  render() {
		let ActionButton = this.props.action ? (
			<FlatButton label={this.props.action_name} fullWidth={true} onTouchTap={this.handleAction} />
		) : null;
		let BoardTable = this.props.is_player ? (
			<MobileTearSheet>
				<Table onRowSelection={this.handleBoardSelection}>
					<TableBody>
						<TableRow key={"card"}>
							<TableRowColumn>{"cards go here"}</TableRowColumn>
						</TableRow>
					</TableBody>
				</Table>
				{ActionButton}
			</MobileTearSheet>
		) : null;
		let KingdomTable = this.props.kingdom ? (
			<MobileTearSheet>
				<Table>
					<TableBody>
						{Object.keys(this.props.kingdom).map(function(key) {
							var val = this.props.kingdom[key];
							return <TableRow key={key}>
											 <TableRowColumn>{key}</TableRowColumn>
											 <TableRowColumn>{val}</TableRowColumn>
										 </TableRow>;
						}, this)}
					</TableBody>
				</Table>
			</MobileTearSheet>
		) : null;
		let PlayerTable = this.props.users ? (
			<MobileTearSheet>
				<Table>
					<TableBody>
						{this.props.users.map(function(obj) {
							return <TableRow key={obj.name}> // change to user count
										   <TableRowColumn>{obj.name}</TableRowColumn>
											 <TableRowColumn>{obj.type ? "player" : "spec"}</TableRowColumn>
										 </TableRow>;
						}, this)}
					</TableBody>
				</Table>
			</MobileTearSheet>
		) : null;
    return (
			<div id='game'>
				{BoardTable}
				{KingdomTable}
				{PlayerTable}
			</div>
		)
  }
};