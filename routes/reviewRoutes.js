const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authoController = require('./../controllers/authController');

//POST/tour/545d4f5a4df/reviews
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authoController.protect,
    authoController.restrictTo('user'),
    reviewController.createReview
  );

router.route('/:id').delete(reviewController.deleteReview);

module.exports = router;
