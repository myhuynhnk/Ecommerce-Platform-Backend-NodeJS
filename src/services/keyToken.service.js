'use strict'

const keyTokenModel = require('../models/keyToken.model');
const { Types } = require('mongoose');

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

    static findByUserId = async ( userId ) => {
        return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean();
    }

    static removeKeyById = async ( id ) => {
        return await keyTokenModel.deleteOne( { _id:  new Types.ObjectId(id)});
    }

    static findByRefreshTokenUsed = async ( refreshToken ) => {
        return await keyTokenModel.findOne({ refreshTokensUsed: refreshToken }).lean();
    }

    static findByRefreshToken = async ( refreshToken ) => {
        return await keyTokenModel.findOne({ refreshToken });
    }

    static deleteKeyById = async ( userId ) => {
        return await keyTokenModel.deleteOne( { user: new Types.ObjectId(userId) });
    }
}


module.exports = KeyTokenService