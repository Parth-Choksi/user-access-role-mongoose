// app.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

module.exports = function() {
    let app = express(),
        create,
        start;

    create = (config, db) => {
        app.use(cors());
        app.options('*', cors());
        app.set('env', config.env);
        app.set('port', config.port);
        app.set('hostname', config.hostname);
        const mongoDB = db.database;
        mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
            if (err) throw err
            console.log("Mongo DB connected");
        });

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        let routes = require('./routes');
        routes.init(app);
    }
    start = () => {
        let hostname = app.get('hostname'),
            port = app.get('port');

        app.listen(port, () => {
            console.log('Server is up and running on port numner ' + port + " hostname " + hostname);
        });
    }
    return {
        create: create,
        start: start
    };
};
