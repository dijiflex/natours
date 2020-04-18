/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe('pk_test_a1jO0CUSqdXrXS247IAvwzB800yCaNJh3p');
export const bookTour = async tourId  =>{
    try {
          //1) Get the session from the server API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);
    


    //2) Create checkouy form+ charge the credit card

    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    });


    } catch (error) {
        // console.log(error.response.data.message);
        showAlert('error', error)
    }
  
}
