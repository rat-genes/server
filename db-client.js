'use strict';

const dotenv = require('dotenv');
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const pg = require('pg');
const Client = pg.Client;

const client = new Client(DATABASE_URL);
client.connect()
    .then(() => console.log('Connected to DB'))
    .catch(err => console.error('Connection error', err));

client.on('error', err => console.error(err));

module.exports = client;