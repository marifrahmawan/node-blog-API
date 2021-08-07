const express = require('express');

const routes = express.Router();

const authController = require('../controller/auth');
const inputValidator = require('../middleware/input-validation');

routes.post(
  '/signup',
  inputValidator.validate('signup'),
  authController.signup
);

routes.post('/login', authController.login);

routes.put('/resetpassword', authController.resetPassword);
routes.put('/resetpassword/:resetToken', authController.createNewPassword);

module.exports = routes;
