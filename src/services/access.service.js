'use strict'

const shopModel = require('../models/shop.model'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async ({name, email, password}) => {
        try {
            //step1: check email exists??
            const holderShop = await shopModel.findOne({ email }).lean();
            if(holderShop) {
                return {
                    code: 'xxxx',
                    message: 'Shop already registered!'
                }
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
                        shop: getInfoData({fields: ['id', 'name', 'email'], object: newShop}),
                        tokens
                    }
                }
            }
            return {
                code: 200,
                metadata: null
            }

        } catch (error) {
            console.log(`Erorr::${error}`);
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}


module.exports = AccessService;