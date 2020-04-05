const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authoController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authoController.protect,
    authoController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
