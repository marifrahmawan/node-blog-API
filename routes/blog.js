const express = require('express');
const routes = express.Router();
const blogController = require('../controller/blog');
const inputValidator = require('../middleware/input-validation');
const isAuth = require('../middleware/is-auth');

routes.get('/feed', isAuth, blogController.getPosts);
routes.get('/feed/:feedId', isAuth, blogController.getPost);
routes.post(
  '/feed',
  isAuth,
  inputValidator.validate('blogPost'),
  blogController.createPost
);

module.exports = routes;
