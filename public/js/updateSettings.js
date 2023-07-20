/* eslint-disable  */
import { showAlert } from './alerts.js';

// type is either 'password' or 'data'
const updateUserSettings = async (data, type) => {
  try {
    // const url = type === 'password' ? 'http://localhost:3000/api/v1/users/updateMyPassword' : 'http://localhost:3000/api/v1/users/updateMe'

    const url = type === 'password' ? 'updateMyPassword' : 'updateMe';

    const res = await axios({
      method: 'PATCH',
      withCredentials: true,
      url: `http://localhost:3000/api/v1/users/${url}`,
      data,
    });

    // Redirect to home page on successful login
    if (res.data.status === 'success') {
      showAlert('success', `Successfully updated account!`);
      // window.setTimeout(() => {
      //     location.assign('/account');
      // }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};


// -------------------- Event Listeners --------------------
// Only add event listener on page with updateForm
const UserUpdateForm = document.querySelector('.form-user-data');
const UserPasswordForm = document.querySelector('.form-user-password');

if (UserUpdateForm) {
  UserUpdateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    

    updateUserSettings(form, 'data');
  });
}

if (UserPasswordForm) {
  UserPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateUserSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    // Empty the password fields on submit
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

