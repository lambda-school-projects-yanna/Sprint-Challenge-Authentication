const axios = require('axios');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/dbConfig');


const { authenticate } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};


generateToken = (user) => {
  const payload = {
      username: user.username,
  };
  const options = {
      expiresIn: '1d',
  };
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, options);
};

function register(req, res) {
  // implement user registration
  let user = req.body;
  user.password = bcrypt.hashSync(user.password, 10);
  db('users').insert(user)
  .then(ids => {
    res.status(201).json({id: ids[0]})
  })
  .catch(err => {
    res.status(500).json(err)
  })
};

function login(req, res) {
  const user = req.body
  db('users')
  .where({username: user.username}).first()
  .then((users) => {
     if (users && bcrypt.compareSync(user.password, users.password)) {
        const token = generateToken(user)
        res.json({message: `Welcome back, ${user.username}!`, token})
      } else {
        res.status(400).json({message: "No! You invalid."})
      }
    })
    .catch((err) => {
      res
        .status(400)
        .json(err)
    })
};

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
