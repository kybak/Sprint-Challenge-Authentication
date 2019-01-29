const axios = require('axios');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { authenticate } = require('../auth/authenticate');
const { JWT } = require('../auth/jwt');
const db = require('../database/helpers/userModel.js');
const bcrypt = require('bcryptjs');


module.exports = server => {
    server.use(cookieParser());
    server.use(bodyParser.json());
    server.post('/api/register', JWT, register);
    server.post('/api/login', JWT, login);
    server.get('/api/jokes', authenticate, getJokes);
};

async function register(req, res) {
    const { username, password } = req.body;
    const saltRounds = 10;

    if (!username || !password) {
        console.log('Missing username and password');
        return res.status(400).json({ error: "Missing username and password" });
    }

    console.log('Registering');

    req.body.password = await bcrypt.hash(password, saltRounds).then(hash => hash);
    db.insert(req.body).then(users => {
        res.cookie('token', req.token, { httpOnly: true });
        res.status(201).json({ users });
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: "There was an error while saving the user to the database",
            info: { err }
        });
    });
}

function login(req, res) {
    console.log("Attempting login", req.body);

    db.login(req.body.username)
        .then(user => {
            if (!user) {
                console.log('User not found');
                return res.status(403).json({ error: "User not found" });
            }

            console.log(user);

            return bcrypt.compare(req.body.password, user.password).then(eq => {
                if (eq) {
                    console.log('Passwords match');
                    res.cookie('token', req.token, { httpOnly: true });
                    res.json({ user });
                } else {
                    console.log('Passwords do not match');
                    throw 'Passwords do not match';
                }
            });

        })
        .catch(err => res.status(500).json({ error: "There was an issue logging in.", info: err }));
}

function getJokes(req, res) {
    const requestOptions = {
        headers: { accept: 'application/json' }
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
