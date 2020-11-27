const game = document.querySelector('.game');
const p1 = document.querySelector('#p1');
const p2 = document.querySelector('#p2');
const ball = document.querySelector('.ball');
const leftScore = document.querySelector('.left_score');
const rightScore = document.querySelector('.right_score');
const details = {};

var io = io();

io.on('connection', function (socket) {
  socket.emit('start');
});

io.on('state', (data) => {
  ball.style.left = data.ball.x + 'px';
  ball.style.top = data.ball.y + 'px';

  p1.style.top = data.left.y + 'px';
  p2.style.top = data.right.y + 'px';
  leftScore.innerHTML = `Player 1: ${data.score.left}`;
  rightScore.innerHTML = `Player 2: ${data.score.right}`;
});

document.body.addEventListener('keydown', (e) => {
  if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
    io.emit('move', e.key);
  }
});

// const checkPlayerPos = (key) => {
//   if (key === 'ArrowUp' || key === 'ArrowDown') {
//     console.log(p1);
//   }
// };

// socket.emit('keypress');
// socket.on('event', function (data) {
//   console.log(data);
// });
// socket.on('disconnect', function () {});
