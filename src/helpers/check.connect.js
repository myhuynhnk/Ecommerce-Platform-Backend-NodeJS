"use strict";
const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECONDS = 5000;

const countConnection = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections::${numConnection}`);
    return numConnection;
}

//check overload
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUse = process.memoryUsage().rss;
        //Maximum number of connections base on number of cores
        //Example every cores have 5 connections
        const maxConnections = numCores * 5;

        console.log(`Active connections::${numConnection}`);
        console.log(`Memory use:: ${memoryUse / 1024 / 1024}MB`);

        if(numConnection > maxConnections) {
            console.log(`Connections overload detected!`);
        }
    }, _SECONDS); //monitor every 5 seconds
    
}

module.exports = {
    countConnection,
    checkOverload
}