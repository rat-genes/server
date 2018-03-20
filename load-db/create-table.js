'use strict';

const client = require('../db-client');

client.query(`
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    password TEXT NOT NULL
    );
`)
    .then(
        () => console.log('db table creation successful'),
        err => console.error(err)
    )
    .then(() => client.end());
