'use strict';

const client = require('../db-client');

client.query(`
    CREATE TABLE IF NOT EXISTS parks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    park_code VARCHAR(10)
    );
`)
    .then(
        () => console.log('db table creation successful'),
        err => console.error(err)
    )
    .then(() => client.end());
