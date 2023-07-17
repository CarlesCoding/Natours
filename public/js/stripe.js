/* eslint-disable */
import { showAlert } from './alerts.js';

// The package needs to be configured with your account's public key.
const stripe = new Stripe(
  'pk_test_51NUdclHtuoCQIKMv4zcpDXPtisy403LTwEuszeJovwc5Aew4jiFlrYlBy2nM0IECRahY7Zniat5stlK8yor7lhQX005obhVivE'
);

const bookTour = async (tourId) => {
  try {
    // 1.) Get checkout session from API endpoint
  const session = await axios({
    method: 'GET',
    withCredentials: true,
    url: `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
  });

  // 2.) Create checkout from + charge credit card
  await stripe.redirectToCheckout({
    sessionId: session.data.session.id
  })
  
  } catch (error) {
    console.log(error)
    showAlert('error', error);
  }
};

// -------------------- Event Listener --------------------
const bookBtn = document.getElementById('book-tour');

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    // button.btn.btn--green.span-all-rows#book-tour(data-tour-id=`${tour.id}`) Book tour now!
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

