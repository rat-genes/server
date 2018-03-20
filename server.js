'use strict';

const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;
const NPS_API_URL = process.env.NPS_API_URL;
const NPS_API_KEY = process.env.NPS_API_KEY;
const TOKEN_KEY = process.env.TOKEN_KEY;

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const sa = require('superagent');
const jwt = require('jsonwebtoken');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = require('./db-client');

function  ensureAdmin (request, response, next) {
    const token = request.get('token') || request.query.token;
    if(!token) next({ status: 401, message: 'No token found'});

    let payload;
    try {
        payload = jwt.verify(token, TOKEN_KEY);
    } catch(err) {
        return next({ status: 403, message: 'Unauthorized' });
    }
    request.user = payload;
    next();
}

function makeToken(id) {
    return { token: jwt.sign({ id: id}, TOKEN_KEY)};
}

app.post('/api/auth/signup', (request, response,next) => {
    const credentials = request.body;
    if(!credentials.name || !credentials.password) {
        return next({ status: 400, message: 'name and password must be provided' });
    }

    client.query(`
        SELECT id
        FROM users
        WHERE name=$1
    `,
    [credentials.name])
        .then(result => {
            if(result.rows.length !== 0) {
                return next({ status: 400, message: 'name already exists' });
            }
            return client.query(`
                INSERT INTO users (name, password)
                VALUES ($1, $2)
                RETURNING id, name;
            `,
            [credentials.name, credentials.password]);
        })
        .then(result => {
            const token = makeToken(result.rows[0].id);
            response.send(token);
        })
        .catch(next);
})

app.get('api/v1/users', (request, response, next) => {
    client.query(`SELECT * FROM users;`
    )
        .then((results) => response.send(results.rows))
        .catch(next);
});

// Calling for park data from API
app.get('/api/v1/parks', (request, response, next) => {

    sa.get(NPS_API_URL)
        .query({
            parkCode: 'olym,crla,mora,noca',
            fields: 'images',
            api_key: NPS_API_KEY
        })
        .then(res => {
            const body = res.body;
            const formatted = {
                parks: body.data.map(park => {
                    return {
                        name: park.fullName,
                        description: park.description,
                        image_url: park.images[0].url,
                        park_code: park.parkCode
                    };
                })
            };
            response.send(formatted);
        })
        .catch(next);
});

app.use((err, request, response, next) => { 
    console.log(err);
    if(err.status) {
        response.status(err.status).send({ error: err.message });
    }
    else {
        response.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log('Server listening for PORT ', PORT);
});


