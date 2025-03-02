// public/js/myBook.js
document.addEventListener('DOMContentLoaded', async () => {
    const myBookContainer = document.getElementById('myBookContainer');
    const errorDiv = document.getElementById('myBookError');
    const token = localStorage.getItem('token');
  
    if (!token) {
      errorDiv.textContent = 'You must be logged in to view your myBook.';
      errorDiv.style.display = 'block';
      return;
    }
  
    try {
      const response = await fetch('/api/myBook', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      const data = await response.json();
      
      if (data.ReturnCode === 200) {
        if (data.Data.length === 0) {
          myBookContainer.innerHTML = '<p class="text-center">You haven\'t added any myBook yet.</p>';
        } else {
          data.Data.forEach(Data => {
            const myBookCard = `
              <div class="col">
              <a href="/book/${Data._id}" class="text-decoration-none">
                <div class="card h-100 shadow-lg">
                  <img src="${Data.coverImage || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${Data.myBookName}">
                  <div class="card-body text-center">
                    <h5 class="card-title">${Data.myBookName}</h5>
                    <p class="card-text">$${Data.price.toFixed(2)}</p>
                  </div>
                </div>
              </a>
              </div>
            `;
            myBookContainer.innerHTML += myBookCard;
          });
        }
        errorDiv.style.display = 'none';
      } else {
        errorDiv.textContent = data.message || 'Failed to load myBook.';
        errorDiv.style.display = 'block';
      }
    } catch (err) {
      console.log(err);
      
      errorDiv.textContent = 'Error loading myBook.';
      errorDiv.style.display = 'block';
      console.error('myBook fetch error:', err);
    }
  });

  