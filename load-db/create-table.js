'use strict';

const client = require('../db-client');

client.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        user_id int,
        FOREIGN KEY (user_id) REFERENCES users (id)                
    );
    CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        trip_id int,
        text TEXT NOT NULL,
        complete VARCHAR(1),
        FOREIGN KEY (trip_id) REFERENCES trips (id)
    );
    `)

    .then(
        () => console.log('All table successfully created'),
        err => console.error(err)
    )

    .then(() => client.end());