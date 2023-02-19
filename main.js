require('./configs/env');

const app = require('./app')();
const appConfig = require('./configs/app');
const db = require('./configs/db');

app.create(appConfig, db);
app.start();
