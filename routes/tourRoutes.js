const express = require('express');
const tourController = require('./../controllers/tourController');
const authoController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router();

// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authoController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authoController.protect,
    authoController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//POST/tour/545d4f5a4df/reviews
//GET/tour/falsdf5d5fg/reviews
//GET/tour/falsdf5d5fg/reviews/545g4f5g4f

router
  .route('/:tourId/reviews')
  .post(
    authoController.protect,
    authoController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
