// Get the form and input fields
const form = document.getElementById('form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

// Function to validate inputs
function validateInputs() {
  // Get the values from the input fields
  const usernameValue = username.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const password2Value = password2.value.trim();

  // Check if the username is empty
  if (usernameValue === '') {
    setError(username, 'Username is required');
  } else {
    setSuccess(username);
  }

  // Check if the email is valid
  if (emailValue === '') {
    setError(email, 'Email is required');
  } else if (!isValidEmail(emailValue)) {
    setError(email, 'Please provide a valid email');
  } else {
    setSuccess(email);
  }

  // Check if the password is at least 8 characters long
  if (passwordValue === '') {
    setError(password, 'Password is required');
  } else if (passwordValue.length < 8) {
    setError(password, 'Password must be at least 8 characters');
  } else {
    setSuccess(password);
  }

  // Check if the password confirmation matches the password
  if (password2Value === '') {
    setError(password2, 'Please confirm your password');
  } else if (password2Value !== passwordValue) {
    setError(password2, 'Passwords do not match');
  } else {
    setSuccess(password2);
  }
}

// Function to set an error message and add error styling
function setError(input, message) {
  const inputControl = input.parentElement; // .input-control div
  const errorDisplay = inputControl.querySelector('.error');

  // Show the error message
  errorDisplay.innerText = message;
  inputControl.classList.add('error');
  inputControl.classList.remove('success');
}

// Function to set success styling
function setSuccess(input) {
  const inputControl = input.parentElement; // .input-control div
  const errorDisplay = inputControl.querySelector('.error');

  // Clear the error message
  errorDisplay.innerText = '';
  inputControl.classList.add('success');
  inputControl.classList.remove('error');
}

// Function to check if the email is valid
function isValidEmail(email) {
  // Basic regex for email validation
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
}

// Event listener for form submission
form.addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent form from submitting
  validateInputs(); // Validate form inputs
});
