/* eslint-disable  */
import { showAlert } from './alerts.js';

/**
 * ******* API CALLS *******
 * Has to use http://localhost:3000/
 * http://127.0.0.1:3000 WILL NOT WORK. CORS :/
 */

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
const loginForm = document.querySelector('.form');
if (loginForm) {
    document.querySelector('.form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout',
    })

    if (res.data.status === 'success') location.reload(true); // Reloads a fresh new page, not from cache.
  } catch (error) {
    showAlert('error', 'Error logging out. Try again!')
  }
}

// Only add event listener on page with loginForm
const logOutBtn = document.querySelector('.nav__el--logout');
console.log(logOutBtn);
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout) 
}

export { login, logout };
