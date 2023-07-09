const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname,'build')));
app.get('/', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
	console.log('user connected');

	//createRoomイベントを受信
	socket.on('createRoom', async (yourName) => {
		const d = new Date();
		//socket.idとuserNameと現在時刻を種にハッシュ値を生成，5桁の16進数に
		const roomID = crypto.createHash('sha256').update(`${socket.id}${yourName}${d}`).digest('hex').slice(0,5);
		//Room roomIDにjoin
		socket.join(roomID);
		//socketにユーザーネーム登録
		socket.data.playerName = yourName;
		//ユーザー名，socket.id, socket.roomsの内容を表示
		console.log(`Player ${yourName} (socket.id=${socket.id}) has created Room ${roomID}.`);
		process.stdout.write('socket.rooms=');
		console.dir(socket.rooms);
		//sendRoomIDイベント発火，roomIDを送信
		io.to(socket.id).emit('sendRoomID',roomID);
		//roomIDのルームに居るプレイヤーの名前をPlayerNamesに格納
		const sts = await io.in(roomID).fetchSockets();
		const playerNames = [];
		for (const st of sts) {
			playerNames.push(st.data.playerName);
		}
		//sendPlayerNamesイベント発火，playerNamesを送信
		io.to(socket.id).emit('sendPlayerNames',playerNames);
	});


	//joinRoomイベントを受信
	socket.on('joinRoom', async (playerName,roomID) => {
		const sts = await io.in(roomID).fetchSockets();
		if (sts.length > 0) {
			socket.join(roomID);
			socket.data.playerName = playerName;
			console.log(`Player ${playerName} (socket.id=${socket.id}) has joined Room ${roomID}.`);
			process.stdout.write('socket.rooms=');
			console.dir(socket.rooms);
			const playerNames = [];
			for (const st of sts) {
				playerNames.push(st.data.playerName);
			}
			playerNames.push(socket.data.playerName);
			io.to(socket.id).emit('sendRoomID',roomID);
			io.to(roomID).emit('sendPlayerNames',playerNames);
		} else {
			io.to(socket.id).emit('errNotExistRoom',roomID);
		}
	});
});
