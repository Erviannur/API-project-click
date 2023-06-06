const { body } = require('express-validator');               //import fungsi body.
const valResultUtils = require('../utils/utilsValidator');   //import valResultUtils.

//memvalidasi data pada permintaan registrasi.
const register = [
  body('email')
    .notEmpty()
    .withMessage('Email tidak boleh kosong.')
    .isEmail()
    .withMessage('email tidak valid.'),
  body('password')
    .notEmpty()
    .withMessage('Password tidak boleh kosong.')
    .isLength({ min: 8 })
    .withMessage('Password harus terdiri dari minimal 8 kata.'),
  body('username')
    .notEmpty()
    .withMessage('Username tidak boleh kosong.')
    .isLength({ min: 2 })
    .withMessage('username maksimal 20 karakter.'),
  valResultUtils,
];

//memvalidasi data pada permintaan login
const login = [
  body('email')
    .notEmpty()
    .withMessage('Email tidak boleh kosong.')
    .isEmail()
    .withMessage('Email tidak valid'),
  body('password')
    .notEmpty()
    .withMessage('Password tidak boleh kosong.'),
  valResultUtils,
];

const authValidator = {   //mendefinisikan objek
  register,
  login
};

module.exports = authValidator;   //export authValidator