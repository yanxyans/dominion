import React from 'react';
import {Table, TableBody, TableRow, TableRowColumn} from 'material-ui/Table';
import MobileTearSheet from './MobileTearSheet';

export default class Container extends React.Component {
  render() {
    return (
			<MobileTearSheet>
				<Table>
					<TableBody>
						{Object.keys(this.props.users).map(function(key) {
							var val = this.props.users[key];
							return <TableRow key={key}>
											 <TableRowColumn>{val.name}</TableRowColumn>
											 <TableRowColumn>{val.type}</TableRowColumn>
										 </TableRow>;
						}, this)}
					</TableBody>
				</Table>
			</MobileTearSheet>
		)
  }
}