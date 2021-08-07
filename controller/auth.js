const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '',
    pass: '',
  },
});

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 500;
      error.message = errors.array().map((e) => {
        return { message: e.msg, location: e.param };
      });
      throw error;
    }

    const { name, username, email, password } = req.body;

    const encryptedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name: name,
      username: username,
      email: email,
      password: encryptedPassword,
    });

    await user.save();

    const message = {
      from: 'nodeblog@server.com',
      to: user.email,
      subject: 'Thank you for Trust us',
      text: 'Success',
      html: '<h1>Success</h1>',
    };

    transporter.sendMail(message, (err) => {
      err.message = "Can't Send Email, Something went wrong !";
      throw err;
    });

    res
      .status(200)
      .json({ message: 'Create User Success.', username: user.username });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('No user with this E-mail');
      error.statusCode = 500;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error('Password doesnt match.');
      error.message = 'Password doesnt match.';
      error.statusCode = 500;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.TOKEN_SECRET,
      { expiresIn: '3d' }
    );

    res
      .status(200)
      .json({ message: 'Loggen In', token: token, userId: user._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("Can't find a User with this E-mail");
      error.message = "Can't find a User with this E-mail";
      error.statusCode = 500;
      throw error;
    }

    const token = crypto.randomBytes(30).toString('hex');
    user.resetToken = token;
    user.resetTokenExpired = Date.now() + 3600000;

    await user.save();

    const message = {
      from: 'nodeblog@server.com',
      to: user.email,
      subject: 'Reset Password',
      text: 'Reset Password',
      html: `<h2>Click this <a href='http://localhost:8080/auth/resetpassword/${user.resetToken}'>Link</a></h2>`,
    };

    transporter.sendMail(message);

    res.status(200).json({ message: 'Check Youre Email to reset Password' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.createNewPassword = async (req, res, next) => {
  try {
    const token = req.params.resetToken;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpired: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error('Invalid Reset Token');
      error.message = 'Invalid Reset Token';
      error.statusCode = 500;
      throw error;
    }

    const newPassword = req.body.password;
    const hashNewPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashNewPassword;
    user.resetToken = undefined;
    user.resetTokenExpired = undefined;

    await user.save();
    res.status(201).json({ message: 'Change password Success!' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
