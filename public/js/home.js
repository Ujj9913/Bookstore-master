// public/js/home.js
document.addEventListener('DOMContentLoaded', () => {
    const myBooksContainer = document.getElementById('myBooksContainer');
    const errorDiv = document.getElementById('myBooksError');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const priceFilter = document.getElementById('priceFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
  
    const fetchMyBooks = async (filters = {}) => {
      try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/allBook?${queryParams}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
  
        const data = await response.json();
        console.log(data);
        
        if (response.ReturnCode != 200) {
          myBooksContainer.innerHTML = '';
          if (data.Data.length === 0) {
            myBooksContainer.innerHTML = '<p class="text-center">No myBooks found.</p>';
          } else {
            data.Data.forEach(myBook => {
              const myBookCard = `
                <div class="col">
                  <a href="/book/${myBook._id}" class="text-decoration-none">
                    <div class="card h-100 shadow-lg">
                      <img src="${myBook.coverImage || 'https://via.placeholder.com/150'}" class="card-img-top" alt="${myBook.bookName}">
                      <div class="card-body text-center">
                        <h5 class="card-title">${myBook.myBookName}</h5>
                        <p class="card-text">$${myBook.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </a>
                </div>
              `;
              myBooksContainer.innerHTML += myBookCard;
            });
          }
          errorDiv.style.display = 'none';
        } else {
          errorDiv.textContent = data.message || 'Failed to load myBooks.';
          errorDiv.style.display = 'block';
        }
      } catch (err) {
        errorDiv.textContent = 'Error loading myBooks.';
        errorDiv.style.display = 'block';
        console.error('MyBooks fetch error:', err);
      }
    };
  
    // Load books when the page loads
    fetchMyBooks();
  
    // Apply filters when the button is clicked
    applyFiltersBtn.addEventListener('click', () => {
      const filters = {
        search: searchInput.value,
        type: typeFilter.value,
        price: priceFilter.value
      };
      fetchMyBooks(filters);
    });
  });