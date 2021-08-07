const Blog = require('../model/blog');
const { validationResult } = require('express-validator');

exports.getPosts = async (req, res, next) => {
  try {
    const blog = await Blog.find();
    if (!blog) {
      const error = new Error("Can't Fetch Post");
      error.statusCode = 500;
      error.message = "Can't Fetch Post";
      throw error;
    }

    res.status(200).json({ message: 'Fetching Success.', data: blog });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const feedId = req.params.feedId;

    const blog = await Blog.findById(feedId);

    if (!blog) {
      const error = new Error("Can't find Blog Post");
      error.statusCode = 500;
      error.message = "Can't find Blog Post.";
      throw error;
    }

    res.status(200).json({ message: 'Fetching success.', data: blog });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      const error = new Error('Validation Faied.');
      error.statusCode = 500;
      error.message = errors.array().map((e) => {
        return { message: e.msg, location: e.param };
      });
      throw error;
    }
    const { title, tags, body } = req.body;

    const post = new Blog({
      title: title,
      tags: tags,
      body: body,
      author: '6108a2483019b608ccc269f7',
    });

    await post.save();
    res.status(200).json({ message: 'Success.', data: post });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
