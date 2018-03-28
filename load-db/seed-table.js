'use strict';

const client = require('../db-client');

// oh dear, what happened here...
// Needs to be "structured data".
// I don't think your app is a content management system.

client.query(`
    INSERT INTO todos (checklist, todos, campground)
    VALUES (
        ' <h2>Trip Checklist</h2>

        <h2>Shelter and Bedding</h2>
        <ul>
          <li>Tent</li>
          <li>Tarp</li>
          <li>Sleepingbag(thickness depending on climate)</li>
          <li>Camp Chairs</li>
          <li>Pillows</li>
        </ul>'
        ,
        ' <li class="done">asdfasdf<p class="remove-todo">X</p></li><li class="done">asdfasdf<p class="remove-todo">X</p></li><li>asdfasdf<p class="remove-todo">X</p></li><li class="done">asdfasdf<p class="remove-todo">X</p></li><li>asdfasdf<p class="remove-todo">X</p></li>'
        ,
        'test'
    );
`)
    .then(
        () => console.log('db table seeding successful'),
        err => console.error(err)
    )
    .then(() => client.end());
