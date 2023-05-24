"use strict"

const mongoose = require('mongoose');

const connectStr = 'mongodb://localhost:27017/storeDEV';

//using singleton pattern to create only instance connect to DB
class Database {
    constructor() {
        this.connect();
    }

    //connect
    connect(type = 'mongodb') {
        // monitor for dev
        if(1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true });
        }

        mongoose.connect((connectStr))
            .then(() => console.log(`Connected mongoDB success`))
            .catch(err => console.log(`Error connect DB ${err}`));
    }

    //static method return instance
    static getInstance() {
        if(!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

const instanceMongoBD = Database.getInstance();
module.exports = instanceMongoBD;