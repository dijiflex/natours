const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1. Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please Provide Email and Password', 400));
  }

  //2 Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password'); //same as email : email

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or password', 401)); //401 means unauthorized
  }
  //3. if everything ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

//Middleware for authorization
exports.protect = catchAsync(async (req, res, next) => {
  //1) Get the token and check if it's there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Your are Not Logged In!. Please log in to get access', 401)
    );
  }

  //2) Verification the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if the user still exitsts
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('User belonging to the token does not exitst', 401)
    );
  }

  //4) if the user changed password after the TOKEN was issued(we create an instance method)


  next();
});
