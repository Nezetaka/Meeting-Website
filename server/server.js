"use strict";

const express = require('express');
const app = express();
const path = require('path');
const nunjucks = require('nunjucks');
const server = require('http').Server(app);
const io = require('socket.io')(server, {serveClient: true});

nunjucks.configure('./client/views', {
  autoescape: true,
  express: app
});

app.use('/assets', express.static('./client/public'));

app.get('/', (req, res) => {
  res.render('index.html');
});

io.on('connection', function (socket) {
  socket.emit('connected', 'You are connected.');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('Server started on port 3000');
});
