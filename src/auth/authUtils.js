'use strict'

const JWT = require('jsonwebtoken');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const asyncHandler = require('../helpers/asyncHandler');
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const createTokenPair = async ( payload, publicKey, privateKey ) => {
    try {
        // accessToken
        // const accessToken = await JWT.sign( payload, privateKey, {
        //     algorithm: 'RS256',
        //     expiresIn: '2 days'
        // });

        // const refreshToken = await JWT.sign( payload, privateKey, {
        //     algorithm: 'RS256',
        //     expiresIn: '7 days'
        // });

        const accessToken = await JWT.sign( payload, publicKey, {
            expiresIn: '2 days'
        });

        const refreshToken = await JWT.sign( payload, privateKey, {
            expiresIn: '7 days'
        });

        //verifyToken
        JWT.verify( accessToken, publicKey,  (err, decode) => {
            if(err) console.error(`Error verify:: ${err}`);
            else console.log(`Decode verify::`, decode);
        });
        return { accessToken, refreshToken };
    } catch (error) {
        return error;
    }
}

const authentication = asyncHandler (async (req, res, next) => {
    /**
     * 1- check userId missing
     * 2- get AccessToken
     * 3- verify token
     * 4- check user in DB
     * 5- check keyStore with this userId
     * 6- Ok all -> return next 
     */

    // 1- check userId(clientId) in headers
    const userId = req.headers[HEADER.CLIENT_ID];
    if(!userId) throw new AuthFailureError('Invalid Request');

    // 2
    const keyStore = await findByUserId(userId);
    if(!keyStore) throw new NotFoundError('Not Found keyStore');

    // 3
    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if(!accessToken) throw new AuthFailureError('Invalid Request');

    try {
        // 4
        const decodeUser = JWT.verify( accessToken, keyStore.publicKey );
        if( userId !== decodeUser.userId ) throw new AuthFailureError('Invalid User');
        req.keyStore = keyStore;
        return next();
    } catch (error) {
        throw error;
    }
})

module.exports = {
    createTokenPair,
    authentication
}