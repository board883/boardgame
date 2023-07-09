import Stock from './Stock.js';
import Bond from './Bond.js';
import Player from './Player.js';
import Year from './Year.js';
import './Game.css';

export default function Game() {
	return (
		<>
			<Year />
			<div id="securities">
				<div><Stock /></div>
				<div><Stock /></div>
				<div><Stock /></div>
				<div><Stock /></div>
				<div><Stock /></div>
				<div><Bond /><Bond /></div>
			</div>
			<div id="players">
				<div><Player /></div>
				<div><Player /></div>
				<div><Player /></div>
				<div><Player /></div>
			</div>
		</>
	);
}
