'use strict';

const client = require('../db-client');

client.query(`
    INSERT INTO users (name, password)
    VALUES ('victor', 'victorissupercool')
    ;
`)
    .then(
        () => console.log('db table seeding successful'),
        err => console.error(err)
    )
    .then(() => client.end());
