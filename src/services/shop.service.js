'use strict'

const shopModel = require("../models/shop.model")

const findByEmail = async ({ email, 
    select = {
        name: 1, email: 1, password: 1, status: 1, roles: 1 
} }) => {
    return await shopModel.findOne({ email }).select(select).lean();
}

module.exports = {
    findByEmail
}