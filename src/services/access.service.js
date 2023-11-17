'use strict'

const shopModel = require('../models/shop.model'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async ({ name, email, password }) => {
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

            if(newShop) {
                const {privateKey, publicKey} = await crypto.generateKeyPair('rsa', {
                    modulusLength: 4096
                })
            }

        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}


module.exports = AccessService;