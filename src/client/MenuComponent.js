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
					<NameComponent name={this.props.name} setName={this.props.setName} />
					<JoinComponent joinRoom={this.props.joinRoom} />
				</List>
				<Divider />
				<SelectableList sel={this.props.sel_room}>
					{Object.keys(this.props.rooms).map(function(key) {
						return <ListItem key={key} value={key}>room {key}</ListItem>;
					})}
				</SelectableList>
			</MobileTearSheet>
    )
  }
}