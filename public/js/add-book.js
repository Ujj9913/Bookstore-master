// public/js/add-book.js
// Preview cover image when URL is manually entered
document.getElementById('coverImage').addEventListener('input', (e) => {
  const coverImageUrl = e.target.value;
  const coverPreview = document.getElementById('coverPreview');
  
  if (coverImageUrl) {
    coverPreview.src = coverImageUrl;
    coverPreview.style.display = 'block';
  } else {
    coverPreview.style.display = 'none';
  }
});

document.getElementById('addBookForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const bookName = document.getElementById('bookName').value;
  const coverImage = document.getElementById('coverImage').value;
  const description = document.getElementById('description').value;
  const bookType = document.getElementById('bookType').value;
  const price = document.getElementById('price').value;
  const errorDiv = document.getElementById('addBookError');
  const successDiv = document.getElementById('addBookSuccess');

  const token = localStorage.getItem('token');
  if (!token) {
    errorDiv.textContent = 'You must be logged in to add a book.';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/api/add-book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookName, coverImage, description, bookType, price })
    });

    const data = await response.json();

    if (response.ok) {
      successDiv.style.display = 'block';
      errorDiv.style.display = 'none';
      document.getElementById('addBookForm').reset();
      document.getElementById('coverPreview').style.display = 'none';
    } else {
      errorDiv.textContent = data.message || 'Failed to add book.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'Error adding book.';
    errorDiv.style.display = 'block';
    console.error('Add book error:', err);
  }
});