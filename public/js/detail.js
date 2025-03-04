// public/js/myBook-detail.js
document.addEventListener('DOMContentLoaded', async () => {
  const myBookName = document.getElementById('myBookName');
  const myBookCover = document.getElementById('myBookCover');
  const myBookType = document.getElementById('myBookType');
  const myBookPrice = document.getElementById('myBookPrice');
  const myBookDescription = document.getElementById('myBookDescription');
  const myBookAddedBy = document.getElementById('myBookAddedBy');
  const errorDiv = document.getElementById('myBookError');
  const token = localStorage.getItem('token');

  if (!token) {
    errorDiv.textContent = 'You must be logged in to view myBook details.';
    errorDiv.style.display = 'block';
    return;
  }

  // Get myBook ID from URL
  const myBookId = window.location.pathname.split('/').pop();

  try {
    const response = await fetch(`/api/book/${myBookId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });


    const data = await response.json();

    if (data.ReturnCode === 200) {
      const myBook = data.Data;

      console.log(myBook);
      myBookName.textContent = myBook.bookName;
      myBookCover.src = myBook.coverImage;
      myBookType.textContent = myBook.bookType;
      myBookPrice.textContent = `$${myBook.price.toFixed(2)}`;
      myBookDescription.textContent = myBook.description || 'No description available.';
      myBookAddedBy.textContent = myBook.addedBy.name || myBook.addedBy; // Assuming User has a name field
      errorDiv.style.display = 'none';
    } else {
      errorDiv.textContent = data.message || 'Failed to load myBook details.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'Error loading myBook details.';
    errorDiv.style.display = 'block';
    console.error('MyBook detail fetch error:', err);
  }
  document.getElementById('editBtn').addEventListener('click', () => {
    window.location.href = `/edit-myBook/${myBookId}`;
  });

  // Delete button functionality
  document.getElementById('deleteBtn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`/api/myBook/${myBookId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          window.location.href = '/myBooks'; // Redirect to book list after deletion
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to delete book');
        }
      } catch (err) {
        alert('Error deleting book');
        console.error('Delete error:', err);
      }
    }
  });
});