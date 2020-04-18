const mongose = require('mongoose');

const bookingSchema = new mongose.Schema({
  tour: {
    type: mongose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking Must belong to a tour']
  },
  user: {
    type: mongose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking Must belong to a tour']
  },
  price: {
    type: Number,
    require: [true, 'Booking Must have a price']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre(/^find/, function(next) {
  //this is only temporary becaue everyone can make bookingswithout payig
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });
  next();
});

const Booking = mongose.model('Booking', bookingSchema);

module.exports = Booking;
