const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authoController = require('./../controllers/authController');

//POST/tour/545d4f5a4df/reviews
const router = express.Router({ mergeParams: true });

router.use(authoController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authoController.protect,
    authoController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authoController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(reviewController.deleteReview);

module.exports = router;
