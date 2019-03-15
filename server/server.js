"use strict";

const express = require('express');
const app = express();
const path = require('path');
const nunjucks = require('nunjucks');

nunjucks.configure('./client', {
  autoescape: true,
  express: app
});

app.get('/', (req, res) => {
  res.render('index.html');
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server started on port 3000');
});
