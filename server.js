'use strict';

const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3000;
const NPS_API_URL = process.env.NPS_API_URL;
const NPSCG_API_URL = process.env.NPSCG_API_URL;
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

const userID = [];

app.post('/api/v1/auth/signup', (request, response, next) => {
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
            userID[0] = result.rows[0].id;
            response.send(userID);
        })
        .catch(next);
});

app.post('/api/v1/auth/login', (request, response, next) => {
    const credentials = request.body;
    if(!credentials.name || !credentials.password) {
        return next({ status: 400, message: 'name and password must be provided' });
    }

    client.query(`
    SELECT id, password
    FROM users
    WHERE name=$1
`,
    [credentials.name])
        .then(result => {
            if(result.rows.length === 0 || result.rows[0].password !== credentials.password) {
                return next({ status: 400, message: 'invalid email or password' });
            }
            userID[0] = result.rows[0].id;
            console.log('GOT HERE', userID[0]);
            response.send(userID);
        })
        .catch(next);
});

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

app.post('/api/v1/todos/save', (request, response, next) => {
    const body = request.body;
    console.log('body.checklistHtml: ', body.checklistHtml);
    console.log('body.todoHtml: ', body.todoHtml);
    console.log('body.campground: ', body.campground);
    return client.query(`
        INSERT INTO todos (checklist, todos, campground)
        VALUES ($1, $2, $3)
        RETURNING checklist, todos, campground;
        `,
    [
        body.checklistHtml,
        body.todoHtml,
        body.campground
    ])
        .then(result => response.send(result.rows[0]))
        .catch(next);
});

app.get('/api/v1/campgrounds/:parkCode', (request, response, next) => {
    const parkCode = request.params.parkCode;
    sa.get(NPSCG_API_URL)
        .query({
            parkCode: parkCode,
            api_key: NPS_API_KEY
        })
        .then(res => {
            const body = res.body;
            const formatted = {
                campgrounds: body.data.map(camp => {
                    return {
                        name: camp.name,
                        description: camp.description,
                        parkCode: parkCode,
                        id: camp.id,
                        
                        directions: camp.directionsUrl,
                        regulations: camp.regulationsUrl,
                        
                        campsites: {
                            total_sites: camp.campsites.totalSites,
                            other_sites: camp.campsites.other,
                            groups_sites: camp.campsites.group,
                            tent_only: camp.campsites.tentOnly,
                            electricity: camp.campsites.electricalHookups,
                            rv: camp.campsites.rvOnly,
                            boat_launch: camp.campsites.walkBoatTo
                        },
                        accessibility: {
                            wheelchair_access: camp.accessibility.wheelchairAccess,
                            fire_policy: camp.accessibility.fireStovePolicy,
                            ada_bathrooms: camp.accessibility.adaInfo
                        },
                        amenities: {
                            toilets: camp.amenities.toilets,
                            showers: camp.amenities.showers
                        }
                    };
                })
            };
            response.send(formatted);
        })
        .catch(next);
});

app.get('/api/v1/trip/load', (request, response, next) => {
    const query = request.query;
    return client.query(`
        SELECT id FROM trips
        WHERE user_id = $1
        ;`,
    [query.id]
    )
        .then(result => {
            response.send(result.rows);
        })
        .catch(next);
});

// Post Trip info to local database
app.post('/api/v1/trip/save', (request, response, next) => {
    const body = request.body;
    return client.query(`
        INSERT INTO trips (park_code, campground_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING id, park_code, campground_id;
        `,
    [
        body.park_code,
        body.campground_id,
        body.user_id
    ])
        .then(result => response.send(result.rows[0]))
        .catch(next);
});

app.use((err, request, response, next) => { //eslint-disable-line
    console.log(err);
    if(err.status) {
        response.status(err.status).send({ error: err.message });
    }
    else {
        response.sendStatus(500);
    }
});

app.delete('/api/v1/profile/deletetrip/:id', (request, response, next) => {
    const id = request.params.id;

    client.query(`
        DELETE FROM trips
        WHERE id=$1;
    `,
    [id]
    )
        .then(result => response.send({ removed: result.rowCount !== 0 }))
        .catch(next);
});

app.listen(PORT, () => {
    console.log('Server listening for PORT ', PORT);
});