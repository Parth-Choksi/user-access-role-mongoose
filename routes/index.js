const express = require('express');
const v1ApiController = require('./v1');
let router = express.Router();

const init = (app) => {
    app.get('*', function (req, res, next) {
        console.log('Request was made to: ' + req.originalUrl);
        return next();
    });
    app.use('/v1', v1ApiController);
}
module.exports = {
    init: init
};