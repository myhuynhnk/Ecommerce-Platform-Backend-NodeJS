const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const app = express();

// const { checkOverload } = require('./helpers/check.connect');

//init middledwares
// app.use(morgan('combined'));
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//init db
require('./dbs/init.mongodb');
// checkOverload();

//init routers
app.use('', require('./routers'));

// app.get('/', (req, res, next) => {
//     const strCompression = 'Hello user';

//     return res.status(200).json({
//         message: 'Welcome my ecommerce platform',
//         metadata: strCompression.repeat(100000)
//     })
// })

//handling errors
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 400;
    next(error);
});

app.use((error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error'
    });
});

module.exports = app;