var express = require('express');
var app = express();
var http = require('http').createServer(app);
const path = require('path');
app.use(express.static(path.join(__dirname, '../client')));
var io = require('socket.io')(http);

http.listen(process.env.PORT || 3000, () => {
  console.log('listening on http://localhost:3000');
});

var useridleft;
var useridright;
var intervalTimer;

var state = {
  left: {
    x: 0,
    y: 165,
  },
  right: {
    x: 0,
    y: 165,
  },
  ball: {
    x: 400,
    y: 165,
    directX: false,
    directY: true,
  },
  score: {
    left: 0,
    right: 0,
  },
};

io.on('connection', (socket) => {
  if (!useridleft) {
    useridleft = socket.id;
    console.log(`player left connected: ${socket.id}`);
  } else if (!useridright) {
    useridright = socket.id;
    console.log(`player right connected: ${socket.id}`);
  }

  if (useridleft && useridright) {
    io.emit('ready', 'emitted ready');
    GameEngine();
  }
  socket.on('disconnect', () => {
    console.log('user disconnected');
    if (useridleft === socket.id) {
      useridleft = '';
    } else if (useridright === socket.id) {
      useridright = '';
    }

    ClearTimer();
  });

  socket.on('move', (data) => {
    if (useridleft == socket.id) {
      PaddleMovement(data, 'left');
    }
    if (useridright == socket.id) {
      PaddleMovement(data, 'right');
    }
  });
});

function GameEngine() {
  intervalTimer = setInterval(() => {
    CheckCollision();
    if (SetScore()) {
      state.ball.x = 400;
      state.ball.y = 240;
      ballSpeed = 1;
      yMovement = Math.random() * 2;
    }
    BallMovement();
  }, 3);
}

let ballSpeed = 1;
let yMovement = 10;
function BallMovement() {
  if (!state.ball.directX) {
    state.ball.x += ballSpeed;
  } else {
    state.ball.x -= ballSpeed;
  }

  if (state.ball.y <= 5) {
    yMovement = Math.random() * 2;
  } else if (state.ball.y >= 440) {
    yMovement = -Math.random() * 2;
  }
  state.ball.y += Math.floor(Math.random() * yMovement);

  io.emit('state', state);
}

function PaddleMovement(data, direction) {
  if (direction == 'left') {
    if (data == 'ArrowUp') {
      state.left.y = Math.max(state.left.y - 50, 0);
    } else if (data == 'ArrowDown') {
      state.left.y = Math.min(state.left.y + 50, 300);
    }
  } else {
    if (data == 'ArrowUp') {
      state.right.y = Math.max(state.right.y - 50, 0);
    } else if (data == 'ArrowDown') {
      state.right.y = Math.min(state.right.y + 50, 310);
    }
  }
}

function ClearTimer() {
  clearInterval(intervalTimer);
}

function CheckCollision() {
  if (state.ball.y >= state.left.y && state.ball.y <= state.left.y + 150) {
    if (state.ball.x < 36) {
      state.ball.directX = false;
      ballSpeed *= 1.1;
      yMovement = Math.random() * 2;
    }
  }
  if (state.ball.y >= state.right.y && state.ball.y <= state.right.y + 150) {
    if (state.ball.x > 724) {
      state.ball.directX = true;
      ballSpeed *= 1.1;
      yMovement = Math.random() * 2;
    }
  }
}

function SetScore() {
  let isGameCompleted = false;
  if (state.ball.x < 0) {
    state.score.right++;
    isGameCompleted = true;
  } else if (state.ball.x > 800) {
    state.score.left++;
    isGameCompleted = true;
  }
  return isGameCompleted;
}
