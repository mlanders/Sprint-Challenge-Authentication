const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const configureRoutes = require('../config/routes.js');

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(morgan('dev'));

configureRoutes(server);

server.get('/', (req, res) => {
	res.send('Sanity Check');
});


module.exports = server;
