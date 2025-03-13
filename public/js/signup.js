document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const errorDiv = document.getElementById('signupError');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            // Get form values
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim(),
                number: document.getElementById('number').value.trim(),
                address: document.getElementById('address').value.trim(),
                interestedBooks: Array.from(document.getElementById('interestedBooks').selectedOptions)
                    .map(option => option.value)
            };

            // Basic validation
            if (!formData.name || !formData.email || !formData.password) {
                showError('Please fill in all required fields.');
                return;
            }

            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (data.ReturnCode === 200) {
                    $('#emailCall').modal('show');
                } else {
                    showError(data.message || 'Signup failed. Please try again.');
                }
            } catch (error) {
                console.error('Signup error:', error);
                showError('An error occurred. Please check your connection and try again.');
            }
        });
    }
});

// Display error message function
function showError(message) {
    const errorDiv = document.getElementById('signupError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Redirect to login after email verification
function login() {
    $('#emailCall').modal('hide');
    window.location.href = '/login';
}