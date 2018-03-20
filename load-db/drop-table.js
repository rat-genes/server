'use strict';

const client = require('../db-client');

client.query(`
   DROP TABLE IF EXISTS users;
`)
    .then(
        () => console.log('db table murder successful'),
        err => console.error(err)
    )
    .then(() => client.end());