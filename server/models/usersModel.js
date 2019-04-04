"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UsersSchema = new Schema ({
  username: {type: String},
  password: {type: String},
  addedAt: {type: Date, default: Date.now},
  status: {type: String},
  birthday: {type: Date},
  address: {type: String},
  contacts: {type: String},
  about: {type: String}
}, {
  versionKey: false,
  collection: "UsersCollection"
});

UsersSchema.pre('save', function(next) {
  if(this.isModified('password') || this.isNew()) this.password = bcrypt.hashSync(this.password, 12);
  next();
});

module.exports = mongoose.model('UsersModel', UsersSchema);
