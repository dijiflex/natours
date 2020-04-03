const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

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
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
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
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('User belonging to the token does not exitst', 401)
    );
  }

  //4) if the user changed password after the TOKEN was issued(we create an instance method)
  currentUser.changedPasswordAfter(decoded.iat);
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User Recently change Password! Please Log in Agaim', 401)
    );
  }

  //GRANT ACCESS TO THE PROTECTED ROUTE,
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin', 'lead-guide] role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have Permission to perform this action', 403) //403 forbidden
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get User based on Posted Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no User with tha Address', 404));
  }
  //2) Generate the Random Token(implemented as an instance method);
  const resetToken = user.createRPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it back as an email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgto password? Submit a PATCH request with your new password and passwordConfirm  to ${resetURL}.\n If you did not forget your password please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset your password (valid 10 mins)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token Sent to Email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try Again Letter'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token
  const hashedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //get user based on the email
  const user = await User.findOne({
    passwordResetToken: hashedtoken,
    passwordResetExpires: { $gt: Date.now() }
  });

  //2) set token if password has not expired and there is a user
  if (!user) {
    return next(new AppError('Tthe token is invalid or Expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) Update the changed password at property  for the user

  //4) log the user in and send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});
