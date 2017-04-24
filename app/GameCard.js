import React from 'react';
import {Card, CardMedia, CardTitle, CardHeader} from 'material-ui/Card';

const styles = {
	card_sel: {
		opacity: 0.5,
		maxWidth: 50,
    width: '100%',
		margin: 5
	},
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
  <Card style={props.sel ? styles.card_sel : styles.card}
				onTouchTap={props._clickCard.bind(null, props.type, props.index)}
				onMouseEnter={props.name ? props._help.bind(null, props.name) : props._help.bind(null, 'blank')}
				onMouseLeave={props._help.bind(null, '')}>
    <CardMedia overlayContentStyle={styles.u}
			overlay={props.amt ? <CardTitle title={props.amt} style={styles.t} titleStyle={styles.title} /> : null}
		>
			<img src={props.name ? '/asset/cards/' + props.name + '.jpg' : '/asset/cards/blank.jpg'} />
    </CardMedia>
		
  </Card>
);

export default GameCard;