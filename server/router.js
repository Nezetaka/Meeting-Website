"use strict";

const UsersModel = require('./models/usersModel');
const _ = require('lodash');
const config = require('./config');
const bcrypt = require('bcryptjs');
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

// token check
function checkAuth (req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, decryptToken, jwtError) => {
    if(jwtError != void(0) || err != void(0)) return res.render('index.html', { error: err || jwtError });
    req.user = decryptToken;
    next();
  }) (req, res, next);
}

function createToken (body) {
  return jwt.sign(
    body,
    config.jwt.secretOrKey,
    {expiresIn: config.expiresIn}
  );
}

module.exports = app => {
  // public directory
  app.use('/assets', express.static('./client/public'));

  // chat page
  app.get('/chat', checkAuth, (req, res) => {
    res.render('index.html', { date: new Date(), username: req.user.username });
  });

  app.get('/', checkAuth, (req, res) => {
    res.render('index.html', { date: new Date(), username: req.user.username });
  });

  // profile page
  app.get('/profile', checkAuth, async (req, res) => {
    try{
    let user = await UsersModel.findOne({username: req.query.userId}).lean().exec();
    if (user != void(0)) {
      res.render('index.html', {  profile: user.username,
                                  username: req.user.username,
                                  status: user.status,
                                  birthday: user.birthday.toISOString().slice(0,10),
                                  address: user.address,
                                  contacts: user.contacts,
                                  about: user.about
                                  });
    } else {
      res.render('index.html', { notFound: "404 PAGE NOT FOUND!" });
    }
    } catch (e) {
      // debug
      console.error("E, profile,", e);
      res.status(500).send({message: "some error"});
    }
  });

  // rendering unknown page
  app.get('*', checkAuth, (req, res) => {
    res.render('index.html', { notFound: "404 PAGE NOT FOUND!" });
  });

  // login
  app.post('/login', async (req, res) => {
    try {
      // find in user database
      let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.username), $options: "i"}}).lean().exec();
      // compare password's hash
      if(user != void(0) && bcrypt.compareSync(req.body.password, user.password)) {
        const token = createToken({ id: user._id,
                                    username: user.username,
                                    status: user.status,
                                    birthday: user.birthday,
                                    address: user.address,
                                    contacts: user.contacts,
                                    about: user.about
                                  });
        res.cookie('token', token, {
          httpOnly: true
        });

        res.status(200).send({message: "User login success!"});
      } else res.status(400).send({message: "User not exist or password not correct"});

    } catch (e) {
      // debug
      console.error("E, login,", e);
      res.status(500).send({message: "some error"});
    }
  });

  // register
  app.post('/register', async (req, res) => {
    try {
      // find in user database
      let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.username), $options: "i"}}).lean().exec();
      if(user != void(0)) return res.status(400).send({message: "User already exist"});

      // create new user
      user = await UsersModel.create({
        username: req.body.username,
        password: req.body.password
      });

      const token = createToken({ id: user._id,
                                  username: user.username,
                                  status: user.status,
                                  birthday: user.birthday,
                                  address: user.address,
                                  contacts: user.contacts,
                                  about: user.about
                                });

      res.cookie('token', token, {
        httpOnly: true
      });

      res.status(200).send({message: "User created!"});
    } catch (e) {
      // debug
      console.error("E, register,", e);
      res.status(500).send({message: "some error"});
    }
  });

  // update user's data
  app.post('/content', async (req, res) => {
    try {
      // find in database
      let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.username), $options: "i"}}).lean().exec();

      UsersModel.findOneAndUpdate({username: {$regex: _.escapeRegExp(req.body.username), $options: "i"}},
      { status: req.body.status,
        birthday: req.body.birthday,
        address: req.body.address,
        contacts: req.body.contacts,
        about: req.body.about
      }, {new: true}, function(err, user){

        // debug
        if(err) return console.log(err);
        console.log("Updated Obj", user);
    });

    res.status(200).send({message: "Changes saved!"});
    } catch (e) {
      // debug
      console.error("E, contact,", e);
      res.status(500).send({message: "some error"});
    }
  });
  // logout
  app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send({message: "Logout success!"});
  })
};
