// public/js/edit-myBook.js
document.addEventListener('DOMContentLoaded', async () => {
    const myBookName = document.getElementById('myBookName');
    const coverImage = document.getElementById('coverImage');
    const coverPreview = document.getElementById('coverPreview');
    const description = document.getElementById('description');
    const myBookType = document.getElementById('myBookType');
    const price = document.getElementById('price');
    const errorDiv = document.getElementById('editMyBookError');
    const successDiv = document.getElementById('editMyBookSuccess');
    const token = localStorage.getItem('token');

    if (!token) {
        errorDiv.textContent = 'You must be logged in to edit a myBook.';
        errorDiv.style.display = 'block';
        return;
    }

    // Get myBook ID from URL (e.g., /edit-myBook/:id)
    const myBookId = window.location.pathname.split('/').pop();

    // Fetch current book data
    try {
        const response = await fetch(`/api/book/${myBookId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log(data);

        if (data.ReturnCode === 200) {
            const myBook = data.Data;
            myBookName.value = myBook.bookName;
            coverImage.value = myBook.coverImage || '';
            description.value = myBook.description || '';
            myBookType.value = myBook.bookType;
            price.value = myBook.price.toFixed(2);
            if (myBook.coverImage) {
                coverPreview.src = myBook.coverImage;
                coverPreview.style.display = 'block';
            }
        } else {
            errorDiv.textContent = data.message || 'Failed to load myBook data.';
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        errorDiv.textContent = 'Error loading myBook data.';
        errorDiv.style.display = 'block';
        console.error('Edit myBook fetch error:', err);
    }

    // Handle form submission
    document.getElementById('editMyBookForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const updatedMyBook = {
            myBookName: myBookName.value,
            coverImage: coverImage.value,
            description: description.value,
            myBookType: myBookType.value,
            price: parseFloat(price.value)
        };

        try {
            const response = await fetch(`/api/book/${myBookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedMyBook)
            });

            const data = await response.json();

            if (response.ok) {
                successDiv.style.display = 'block';
                errorDiv.style.display = 'none';
                setTimeout(() => {
                    window.location.href = `/book/${myBookId}`;
                }, 1500);
            } else {
                errorDiv.textContent = data.message || 'Failed to update myBook.';
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            errorDiv.textContent = 'Error updating myBook.';
            errorDiv.style.display = 'block';
            console.error('Update myBook error:', err);
        }
    });
});