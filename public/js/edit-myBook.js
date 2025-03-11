// public/js/edit-profile.js
document.addEventListener('DOMContentLoaded', async () => {
    const profileImagePreview = document.getElementById('profileImagePreview');
    const nameInput = document.getElementById('name');
    const numberInput = document.getElementById('number');
    const addressInput = document.getElementById('address');
    const postcodeInput = document.getElementById('postcode');
    const emailInput = document.getElementById('email');
    const interestedBooksSelect = document.getElementById('interestedBooks');
    const editProfileForm = document.getElementById('editProfileForm');
    const editProfileError = document.getElementById('editProfileError');
    const token = localStorage.getItem('token');

    if (!token) {
        editProfileError.textContent = 'You must be logged in to edit your profile.';
        editProfileError.style.display = 'block';
        return;
    }

    // Fetch and populate initial data
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        console.log('dtaaaaa><>', data);

        if (data.ReturnCode == 200) {
            const user = data.Data;
            // Use random profile image if profile_img is empty
            profileImagePreview.src = user.profile_img || `https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png`;
            nameInput.value = user.name || '';
            numberInput.value = user.number || '';
            addressInput.value = user.address || '';
            postcodeInput.value = user.postcode || '';
            emailInput.value = user.email || '';

            // Pre-select interested books
            if (user.interestedBooks && user.interestedBooks.length > 0) {
                const options = interestedBooksSelect.options;
                for (let i = 0; i < options.length; i++) {
                    if (user.interestedBooks.includes(options[i].value)) {
                        options[i].selected = true;
                    }
                }
            }

            editProfileError.style.display = 'none';
        } else {
            editProfileError.textContent = data.message || 'Failed to load profile data.';
            editProfileError.style.display = 'block';
        }
    } catch (err) {
        editProfileError.textContent = 'Error loading profile data.';
        editProfileError.style.display = 'block';
        console.error('Initial data fetch error:', err);
    }

    // Preview image on upload
    function previewImage(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Form submission
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        editProfileError.style.display = 'none';

        const formData = new FormData(editProfileForm);
        const name = formData.get('name');
        const number = formData.get('number');
        const address = formData.get('address');
        const postcode = formData.get('postcode');
        const interestedBooks = Array.from(interestedBooksSelect.selectedOptions).map(option => option.value);

        // Update formData with interestedBooks as an array
        formData.set('interestedBooks', interestedBooks.join(','));

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert('Profile updated successfully!');
                window.location.href = '/profile'; // Redirect back to profile page
            } else {
                editProfileError.textContent = data.message || 'Failed to update profile.';
                editProfileError.style.display = 'block';
            }
        } catch (err) {
            editProfileError.textContent = 'Error updating profile.';
            editProfileError.style.display = 'block';
            console.error('Update error:', err);
        }
    });
});