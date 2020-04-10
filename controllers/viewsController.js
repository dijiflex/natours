const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  //1) Get tour data from our collection
  const tours = await Tour.find();

  //2) build template

  //3) render template
  res.status(200).render('overview', {
    tour: 'The Foresst',
    tours
  });
});

exports.getTour = catchAsync(async (req, res) => {
  //1) Get the data, for the requested tour(including  reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  //2) Build template

  //3 Render templated using the data from step 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour: tour
  });
});
