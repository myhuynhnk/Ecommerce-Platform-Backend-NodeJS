'use strict'

const express = require('express');
const router = express.Router();
const { apiKey, permission } = require('../auth/checkAuth');

//check apiKey
router.use(apiKey);
//check permission
router.use(permission('0000'));

router.use('/v1/api', require('./access'));
// router.get('/', (req, res, next) => {
//     return res.status(200).json({
//         message: 'Welcome my ecommerce platform',
//     })
// })

module.exports = router;