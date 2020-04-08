const express = require('express');
const tourController = require('./../controllers/tourController');
const authoController = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authoController.protect,
    authoController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authoController.protect,
    authoController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authoController.protect,
    authoController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authoController.protect,
    authoController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//POST/tour/545d4f5a4df/reviews
//GET/tour/falsdf5d5fg/reviews
//GET/tour/falsdf5d5fg/reviews/545g4f5g4f

module.exports = router;
