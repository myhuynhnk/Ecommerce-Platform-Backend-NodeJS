'use strict'

const shopModel = require('../models/shop.model'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { ConflictRequestError, BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    /*
        check this token used
    */
    static handlerRefreshToken = async ( refreshToken ) => {
        // check whether this token has been used yet?
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
        console.log('foundToken:::', foundToken);
        // if find out 
        if(foundToken) {
            // decode to check if it is in the system? get payload JSONwebtoken
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey);
            console.log('Payload Verified:::', {userId, email});
            // delete tokens in keyStore
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something went wrong happened!! Please re-login.');
        }
        
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
        console.log('holderToken:::', holderToken);
        if(!holderToken) throw new AuthFailureError(' Shop not registered ');
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey);
        console.log('Payload Tokens is being used:::', {userId, email});

        // check shop by userId(ShopID)
        const foundShop = await findByEmail({ email });
        console.log('foundShop:::', foundShop);
        if(!foundShop) throw new AuthFailureError(' Shop not registered with email: ', email);

        // create a new tokens pair
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey);
        //update tokens to keyStore
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        });

        return {
            user: {userId, email},
            tokens
        }
    }


    /*
        1. check email is in db
        2. match password
        3. create Access and Refresh Tokens
        4. generate tokens
        5. get data return login
    */
    static login = async ({ email, password, refreshToken = null}) => {
        const foundShop = await findByEmail ({ email });
        if(!foundShop) throw new BadRequestError('Shop is not registered');
        
        const match = await bcrypt.compare(password, foundShop.password);
        if(!match) throw new AuthFailureError('Authentication Error');

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');
        const { _id: userId} = foundShop;
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey);
        await KeyTokenService.createKeyToken({
            userId,
            publicKey,
            privateKey,
            refreshToken: tokens.refreshToken
        })

        return {
            shop: getInfoData({fields: ['_id', 'name', 'email'], object: foundShop}),
            tokens
        }
    }

    // logout
    static logout = async ( keyStore ) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log({ delKey });
        return delKey;
    }

    static signUp = async ({name, email, password}) => {
        // try {
            //step1: check email exists??
            const holderShop = await shopModel.findOne({ email }).lean();
            if(holderShop) {
                // return {
                //     code: 'xxxx',
                //     message: 'Shop already registered!'
                // }
                throw new BadRequestError('Error: Shop already registered! ')
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            });
            
            /**
             * create publicKey and privateKey use RSA256 algorithm
             *
            if(newShop) {
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    }
                });

                console.log({ privateKey, publicKey }); // generate private & public key

                //Save publicKey to KeyTokenModel collection
                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey
                });
                console.log(`publicKeyString::${publicKeyString}`);

                if(!publicKeyString) {
                    return {
                        code: 'xxx',
                        message: 'publicKeyString error'
                    }
                }
 
                const publicKeyObject = crypto.createPublicKey(publicKeyString);
                console.log(`publicKeyObject::`, publicKeyObject);

                // Generate AccessToken & RefreshToken
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyObject, privateKey);
                console.log(`Created Token Success::`, tokens);

                return{
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields: ['id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }

            }
            *
            */

            //create public & private key with simple normally way
            if(newShop) {            
                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');

                console.log({ privateKey, publicKey });
                //Save key to KeyTokenModel collection
                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                });

                if(!keyStore) {
                    return {
                        code: 'xxx',
                        message: 'keyStore error'
                    }
                }

                //create tokens pair (accessToken and refreshToken)
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey);
                console.log(`Created Token Success::`, tokens);

                return{
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields: ['_id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
            }
            return {
                code: 200,
                metadata: null
            }

        // } catch (error) {
        //     console.log(`Erorr::${error}`);
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}


module.exports = AccessService;