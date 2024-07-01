'use strict'

const AccessService = require('../services/access.service');
const { OK, CREATED, SuccessResponse } = require('../core/success.response');

class AccessController {
    login = async ( req, res, next ) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body),
        }).send(res);
    }

    logout = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'Logout Success!',
            metadata: await AccessService.logout(req.keyStore),
        }).send(res);
    }

    handlerRefreshToken = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'Get Tokens Success!',
            metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
        }).send(res);
    }

    signUp = async ( req, res, next ) => {
        // try {
        //     console.log(`[P]::signUp:: ${req.body}`);
        //     return res.status(201).json( await AccessService.signUp(req.body));
        // } catch (error) {
        //     next(error);
        // }

        new CREATED({
            message: 'Registered OK!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res);
        // return res.status(201).json( await AccessService.signUp(req.body));
    }

   
}

module.exports = new AccessController();