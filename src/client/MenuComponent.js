import React from 'react';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import MobileTearSheet from './MobileTearSheet';
import NameComponent from './NameComponent';
import JoinComponent from './JoinComponent';
import SelectableList from './SelectableList';

export default class MenuComponent extends React.Component {
  render() {
    return (
			<MobileTearSheet>
				<List>
					<NameComponent name={this.props.name} _setName={this.props._setName} />
					<JoinComponent _joinGame={this.props._joinGame} />
				</List>
				<Divider />
				<SelectableList inRoom={this.props.inRoom} _enterGame={this.props._enterGame}>
					{Object.keys(this.props.rooms).map(function(room) {
						return <ListItem key={room} value={room}>{room}</ListItem>;
					})}
				</SelectableList>
			</MobileTearSheet>
    )
  }
};