const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const app = express();

//init middledwares
// app.use(morgan('combined'));
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

//init db

//init routers
app.get('/', (req, res, next) => {
    const strCompression = 'Hello user';

    return res.status(200).json({
        message: 'Welcome my ecommerce platform',
        metadata: strCompression.repeat(100000)
    })
})

//handling errors

module.exports = app;