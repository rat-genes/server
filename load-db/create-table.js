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
        park_code VARCHAR(255) NOT NULL,
        campground_id VARCHAR(255) NOT NULL,
        user_id int,
        FOREIGN KEY (user_id) REFERENCES users (id)                
    );
    CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        trip_id int,
        checklist TEXT NOT NULL,
        todos TEXT NOT NULL,
        campground VARCHAR(256),
        FOREIGN KEY (trip_id) REFERENCES trips (id)
    );
    `)

    .then(
        () => console.log('All table successfully created'),
        err => console.error(err)
    )

    .then(() => client.end());