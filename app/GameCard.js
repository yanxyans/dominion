import React from 'react';
import {Card, CardMedia, CardTitle, CardHeader} from 'material-ui/Card';

const styles = {
	card: {
		maxWidth: 50,
    width: '100%',
		margin: 5
	},
	title: {
		textAlign: 'center',
		fontSize: 15,
		lineHeight: 0,
	},
	t: {
		padding: 10
	},
	u: {
		padding: 0
	}
};

const GameCard = (props) => (
  <Card style={styles.card} onTouchTap={props.onTouchTap} >
    <CardMedia overlayContentStyle={styles.u}
			overlay={props.amt === -1 ? null :
				<CardTitle title={props.amt}
				           style={styles.t}
									 titleStyle={styles.title} />
			}
		>
			<img src={props.name ? '/asset/cards/' + props.name + '.jpg' : '/asset/cards/blank.jpg'} />
    </CardMedia>
		
  </Card>
);

export default GameCard;