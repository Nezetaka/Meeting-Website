"use strict";

const MessageModel = require('./models/messagesModel');
const UsersModel = require('./models/usersModel');
const express = require('express');
const _ = require('lodash');

module.exports = io => {
  io.on('connection', function (socket) {
    socket.emit('connected', 'You are connected.');

    // join to room
    socket.join('all');

    socket.on('msg', async (content, req, res) => {
      let user = await UsersModel.findOne({username: "admin"}).lean().exec();
      //let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.username), $options: "i"}}).lean().exec();
      const obj = {
        date: new Date(),
        content: content,
        username: user.username
      };

       MessageModel.create(obj, err => {
         if(err) return console.error("MessageModel", err);
         socket.emit("message", obj);
         socket.to('all').emit("message", obj);
       });
    });

    // get messages
    socket.on('receiveHistory', () => {
      MessageModel
        .find({})
        .sort({date: -1})
        .limit(50)
        .sort({date: 1})
        .lean()
        .exec( (err, messages) => {
          if(!err) {
            socket.emit("history", messages);
          }
        })
    })
  });
};
