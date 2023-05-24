"use strict"

const mongoose = require('mongoose');

const connectStr = 'mongodb://localhost:27017/storeDEV';

mongoose.connect((connectStr))
    .then(() => console.log(`Connected mongoDB`))
    .catch(err => console.log(`Error connect DB ${err}`));

//dev

if( 1===1 ) {
    mongoose.set('debug', true);
    mongoose.set('debug', {color: true});
}

module.exports = mongoose;