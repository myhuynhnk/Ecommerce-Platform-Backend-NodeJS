'use strict'

const express = require('express');
const router = express.Router();
const AccessController = require('../../controllers/access.controller');
const { asyncHandler } = require('../../auth/checkAuth');
const { authentication } = require('../../auth/authUtils');
//signUp
router.post('/shop/signup', asyncHandler(AccessController.signUp));
//login
router.post('/shop/login', asyncHandler(AccessController.login));

//authentication
router.use(authentication);
//logout
router.post('/shop/logout', asyncHandler(AccessController.logout));
router.post('/shop/handlerRefreshToken', asyncHandler(AccessController.handlerRefreshToken));

module.exports = router;