// Function to validate inputs
export function validateInputs() {
  let isValid = true;

  // Get the values from the input fields
  const usernameValue = username.value.trim();
  const passwordValue = password.value.trim();

  // Validate Username: Check if the username is empty
  if (usernameValue === '') {
    setError(username, 'Username is required');
    isValid = false;
  } else {
    setSuccess(username);
  }

  // Validate Password: Check if the password is at least 8 characters long
  if (passwordValue === '') {
    setError(password, 'Password is required');
    isValid = false;
  } else if (passwordValue.length < 8) {
    setError(password, 'Password must be at least 8 characters');
    isValid = false;
  } else {
    setSuccess(password);
  }

  return isValid;
}

// Function to set an error message and add error styling
export function setError(input, message) {
  const inputControl = input.parentElement; // .input-control div
  const errorDisplay = inputControl.querySelector('.error');

  // Show the error message
  errorDisplay.innerText = message;
  inputControl.classList.add('error');
  inputControl.classList.remove('success');
}

// Function to set success styling
export function setSuccess(input) {
  const inputControl = input.parentElement; // .input-control div
  const errorDisplay = inputControl.querySelector('.error');

  // Clear the error message
  errorDisplay.innerText = '';
  inputControl.classList.add('success');
  inputControl.classList.remove('error');
}
