const axios = require('axios');
const bcrypt = require('bcryptjs');
const db = require('../database/dbConfig');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

const { authenticate } = require('../auth/authenticate');

module.exports = server => {
	server.post('/api/register', register);
	server.post('/api/login', login);
	server.get('/api/jokes', authenticate, getJokes);
};

function generateToken(user) {
	const payload = {
		subject: user.id,
		username: user.username,
	};
	const options = {
		expiresIn: '1d',
	};
	return jwt.sign(payload, secret, options);
}

async function register(req, res) {
	let user = req.body;
	const hash = bcrypt.hashSync(user.password, 8);
	user.password = hash;

	try {
		const result = await db('users').insert(user);
		console.log(result);
		res.status(201).json({ message: 'Registration Successful' });
	} catch {
		res.status(500).json({ message: 'Registration failed' });
	}
}

async function login(req, res) {
	let { username, password } = req.body;
	const user = await db('users')
		.where('username', username)
		.first();
	console.log(username);
	console.log(user.username);
	if (user && bcrypt.compareSync(password, user.password)) {
		try {
			const token = generateToken(user);
			res.status(200).json({ message: 'Login Successful', token });
		} catch {
			res.status(404).json({ message: 'unable to find that user' });
		}
	} else {
		res.status(500).json({ message: 'Error logging in' });
	}
}

function getJokes(req, res) {
	let token = req.headers.authorization;
	const requestOptions = {
		headers: { accept: 'application/json', authorization: token },
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
