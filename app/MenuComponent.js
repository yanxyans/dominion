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
			<div id='menu'>
				<MobileTearSheet>
					<List>
						<NameComponent name={this.props.name} _setName={this.props._setName} />
						<JoinComponent _joinRoom={this.props._joinRoom} />
					</List>
					<Divider />
					<SelectableList current={this.props.current} _setRoom={this.props._setRoom}>
						{Object.keys(this.props.rooms).map(function(room, index) {
							return <ListItem key={index} value={this[index]}>{this[index]}</ListItem>;
						}, this.props.rooms)}
					</SelectableList>
				</MobileTearSheet>
			</div>
    )
  }
};