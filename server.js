'use strict';

const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;
const NPS_API_URL = process.env.NPS_API_URL;
const NPS_API_KEY = process.env.NPS_API_KEY;

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const sa = require('superagent');

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = require('./db-client');

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


