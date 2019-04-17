//模拟的账号密码
var users = [
  {
    id: 1,
    name: 'jonathanmh',
    password: 'aaa'
  },
  {
    id: 2,
    name: 'test',
    password: 'test'
  }
];

var express = require("express");
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var passport = require("passport");
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'tasmanianDevil';

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  var user = users.find(user => user.id === jwt_payload.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);

var app = express();

app.use(express.static('./public'))

app.use(passport.initialize());

app.use(bodyParser.urlencoded({
  extended: true
}));

// parse application/json
app.use(bodyParser.json())

app.post("/login", function (req, res) {
  if (req.body.name && req.body.password) {
    var name = req.body.name;
    var password = req.body.password;
  }
  // usually this would be a database call:
  var user = users.find(user => user.name === name);
  if (!user) {
    res.status(401).json({ message: "用户名错误" });
  }

  if (user.password === req.body.password) {
    var payload = { id: user.id };
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({status:200, message: "ok", token: token });
  } else {
    res.status(401).json({ status:401,message: "passwords did not match" });
  }
});

app.get("/user", passport.authenticate('jwt', { session: false }), function (req, res) {
  res.json({ status: 200, message: "Success! You can not see this without a token" });
});

app.get("/pub", function(req, res) {
  res.json({status:200,message: "Express is up!"});
});

app.listen(3000, function() {
  console.log("Express running");
});