const { body } = require('express-validator');
const User = require('../model/user');

exports.validate = (method) => {
  switch (method) {
    case 'signup': {
      return [
        body('name')
          .not()
          .isEmpty()
          .withMessage("Name can't be empty.")
          .isLength({ min: 5 })
          .withMessage('Name must be more than 5 characters.')
          .matches(/^[a-zA-Z ]+$/)
          .withMessage("Name can't contain special character or number.")
          .trim(),
        body('username')
          .not()
          .isEmpty()
          .withMessage("Username can't be empty")
          .isLength({ min: 5 })
          .withMessage('Username must be more than 5 characters.')
          .matches(/^[a-zA-Z0-9]+$/)
          .withMessage("Username can't contain space.")
          .trim()
          .custom((value) => {
            return User.findOne({ username: value }).then((user) => {
              if (user) {
                return Promise.reject('Username already use.');
              }
            });
          }),
        body('email')
          .not()
          .isEmpty()
          .withMessage("Email can't be empty")
          .isLength({ min: 5 })
          .withMessage('Email must be more than 5 characters.')
          .isEmail()
          .withMessage('Enter a valid Email')
          .trim()
          .custom((value) => {
            return User.findOne({ email: value }).then((user) => {
              if (user) {
                return Promise.reject('Email already use.');
              }
            });
          }),
        body('password')
          .not()
          .isEmpty()
          .withMessage("Username can't be empty")
          .isLength({ min: 8 })
          .withMessage('Password must be more than 8 characters.')
          .matches(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
          )
          .withMessage(
            'Password minimum eight characters, at least one letter, one number and one special character.'
          )
          .trim(),
        body('confirmPassword').custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password Confirmation does not match.');
          }
          return true;
        }),
      ];
    }

    case 'blogPost': {
      return [
        body('title')
          .not()
          .isEmpty()
          .withMessage("Title can't be Empty.")
          .isLength({ min: 5 })
          .withMessage('Title minimal 5 Characters'),
        body('tags').not().isEmpty().withMessage("Tags Can't be Empty."),
        body('body').not().isEmpty().withMessage("Body Can't be Empty."),
      ];
    }
  }
};
