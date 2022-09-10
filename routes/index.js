const Router = require('express').Router();
const authRoute = require('./auth');
const userRoute = require('./user');

Router.use('/auth', authRoute);
Router.use('/user', userRoute);

module.exports = Router;