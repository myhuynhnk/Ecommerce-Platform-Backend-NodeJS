'use strict'

const keyTokenModel = require('../models/keyToken.model');

class KeyTokenService {

    // Advangate way: match with access.service.js step use RSA256 to create public and private key
    // static createKeyToken = async ({ userId, publicKey }) => {
    //     try {
    //         const publicKeyString = publicKey.toString();
    //         const tokens = await keyTokenModel.create({
    //             user: userId,
    //             publicKey: publicKeyString,
    //         });

    //         return tokens ? tokens.publicKey : null;
            
    //     } catch (error) {
    //         return error;
    //     }
    // }

    // simple normally way
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            // level 0
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // });

            // return tokens ? tokens.publicKey : null;
            

            // level xxxx use atomic mongoDB
            const filter = { user: userId };
            const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken };
            const options = { upsert: true, new: true }; // if yes then update and no then insert new one
            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)
            
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    }
}


module.exports = KeyTokenService