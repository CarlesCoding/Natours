/* eslint-disable  */
import { showAlert } from './alerts.js';

/**
 * ******* API CALLS *******
 * Has to use http://localhost:3000/
 * http://127.0.0.1:3000 WILL NOT WORK. CORS :/
 * 
 * 
 * In local environment OR if the backend & frontend are hosted on diff urls use:
 * http://localhost:3000/api/v1/users/login
 * 
 * OTHERWISE, IF ON SAME URL, ABLE TO USE:
 * /api/v1/users/login
 */

// -------------------- LOGIN -------------------- //

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      withCredentials: true,
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    // Redirect to home page on successful login
    if (res.data.status === 'success') {
      showAlert('success', `Logged in successfully!`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

// Only add event listener on page with loginForm
const loginForm = document.querySelector('.login-form');
if (loginForm) {
  loginForm.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

// -------------------- LOGOUT -------------------- //
const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    });
    
    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/login');
      }, 300);
    }
  } catch (error) {
    showAlert('error', 'Error logging out. Try again!');
  }
};

// Only add event listener on page with loginForm
const logOutBtn = document.querySelector('.nav__el--logout');
if (logOutBtn) logOutBtn.addEventListener('click', logout);

// -------------------- Sign up -------------------- //
const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      withCredentials: true,
      url: 'http://localhost:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm, //! FIX THIS; NO NEED PASSWORDCONFIRM SILLY
      },
    });

    // Redirect to home page on successful login
    if (res.data.status === 'success') {
      showAlert('success', `Signed up successfully!`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

// Only add event listener on page with signupForm
const signupForm = document.querySelector('.signup-form');
if (signupForm) {
  signupForm.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirmPassword').value;
    signup(name, email, password, passwordConfirm);
  });
}


