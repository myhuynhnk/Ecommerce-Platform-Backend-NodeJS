'use strict'

const { findById } = require('../services/apikey.service');

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) => {
    try {
        // check Key on headers
        const key = req.headers[HEADER.API_KEY].toString();
        if(!key) {
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }

        // check key is exists in apiKey collection 
        const objKey = await findById(key);
        if(!objKey) {
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }

        req.objKey = objKey;
        return next();

    } catch (error) {
        
    }
}

const permission = (permission) => {
    // closure js
    return (req, res, next) => {
        if(!req.objKey.permissions) {
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }

        console.log(`Permission::`, req.objKey.permissions);
        const validPermission = req.objKey.permissions.includes(permission);
        if(!validPermission) {
            return res.status(403).json({
                message: 'Permission Denied'
            })
        }

        return next();
    }
}

const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    }
}

module.exports = {
    apiKey,
    permission,
    asyncHandler
}