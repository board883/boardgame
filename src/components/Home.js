import { useState, useRef, useEffect } from 'react';
import { socket } from '../socket';

export function Home() {
	const yourNameInput = useRef(null);
	const [yourName, setYourName] = useState('');
	const [isJoined, setIsJoined] = useState(false);
	const [roomID, setRoomID] = useState('');
	const [isHost, setIsHost] = useState(false);
	const [playerNames, setPlayerNames] = useState([]);

	// createクリック時の動作
	function clickCreate() {
		if (yourNameInput.current.value === '') {
			alert('Fill in Your name');
			return;
		}
		// 'createRoom'イベントを発火，yourNameを送信
		socket.emit('createRoom', yourNameInput.current.value);
		setIsHost(true);
	}

	// joinクリック時の動作
	function clickJoin() {
		if (yourNameInput.current.value === '') {
			alert('Fill in Your name');
			return;
		}
		const RID = prompt('Fill in a Room ID');
		// 'joinRoom'イベントを発火
		socket.emit('joinRoom',yourNameInput.current.value,RID);
	}

	useEffect(() => {
		socket.on('sendRoomID', (RID) => {
			setRoomID(RID);
			setIsJoined(true);
			//yourNameをセット
			setYourName(yourNameInput.current.value);
		});

		socket.on('errNotExistRoom', (RID) => {
			alert(`Room ${RID} does not exist.`);
		});

		socket.on('sendPlayerNames', (array) => {
			setPlayerNames(array);
		});
	},[]);

	return (
		<div>
		{
			isJoined ? (
				isHost ? (
					<>
						<p> You have created Room {roomID} </p>
						<p> Your name: { yourName } </p>
						<p> Room ID: { roomID } </p>
						<p> Players: 
							<ul>
							{ playerNames.map(player => <li> {player} </li>) }
							</ul>
						</p>
						<p> Press the start button to begin the game!</p>
						<p> <button>game start</button> </p>
					</> )
				:
					(	
					<>
						<p> You are now in Room { roomID } </p>
						<p> Room ID: { roomID } </p>
						<p> Your name: { yourName } </p>
						<p> Players: 
							<ul>
							{ playerNames.map(player => <li> {player} </li>) }
							</ul>
						</p>
						<p> Wait for the host to start the game </p>
					</>
					)
			)
			:
				(
				<>
					<p>Your name: <input type="text" ref={yourNameInput}></input></p>
					<p>
						<button onClick={ clickCreate }>create</button>
						<button onClick={ clickJoin }>join</button>
					</p>
				</>
				)
			}
		</div>
	);
}
