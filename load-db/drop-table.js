'use strict';

const client = require('../db-client');

client.query(`
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;
`)
    .then(
        () => console.log('All tables successfully removed'),
        err => console.error(err)
    )

    .then(() => client.end());