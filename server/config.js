"use strict";

function ExtractJwt (req) {
  let token = null;
  if(req.cookies && req.cookies.token != void(0)) token = req.cookies['token'];
  return token;
}

module.exports = {
  jwt: {
    jwtFromRequest: ExtractJwt,
    secretOrKey: 'ZKZ6mjg1VFguA9Qy'
  },

  expiresIn: "1 day"
};
