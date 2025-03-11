var bookId = window.location.pathname.split('/').pop()
var token = localStorage.getItem('token');
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
  const bookOwnerName = document.getElementById('bookOwnerName');
  const bookOwnerEmail = document.getElementById('bookOwnerEmail');
  const bookOwnerPhone = document.getElementById('bookOwnerPhone');
  const bookOwnerAddress = document.getElementById('bookOwnerAddress');
  var adminDiv = document.getElementById("admin");
  var common = document.getElementById("common");
  var owerDetail = document.getElementById("owerDetail");
  const distanceLabel = document.getElementById('distanceLabel');
  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([0, 0]), // Default center
      zoom: 2
    })
  });
  adminDiv.classList.add("hidden");
  common.classList.add("hidden")
  owerDetail.classList.add("hidden")
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

      myBook.admin ? common.remove("hidden") || owerDetail.remove("hidden") : adminDiv.remove("hidden");
      myBookName.textContent = myBook.bookName;
      myBookCover.src = myBook.coverImage;
      myBookType.textContent = myBook.bookType;
      myBookPrice.textContent = `€${myBook.price.toFixed(2)}`;
      myBookDescription.textContent = myBook.description || 'No description available.';
      bookOwnerName.textContent = myBook.sellerData.name || ''
      bookOwnerEmail.textContent = myBook.sellerData.email || ''
      bookOwnerPhone.textContent = myBook.sellerData.number || ''
      bookOwnerAddress.textContent = myBook.sellerData.address || ''
      errorDiv.style.display = 'none';
      if (myBook.admin == false) {
        calculateDistanceAndShowMap(myBook.userData.postcode, myBook.sellerData.postcode, map, distanceLabel)



        onlineDetail(myBook)
      } else {
        onlineDetail(myBook)
      }


    } else {
      errorDiv.textContent = data.message || 'Failed to load Book details.';
      errorDiv.style.display = 'block';
    }

  } catch (err) {
    console.log(err);

    errorDiv.textContent = 'Error loading Book details.';
    errorDiv.style.display = 'block';

  }

});
function renderJSON(data) {
  let htmlContent = '';

  // Loop through the keys of the JSON object
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];

      // Check if the value is an object (nested data)
      if (typeof value === 'object' && !Array.isArray(value)) {
        htmlContent += `<div class="row"><div class="col-md-12"><h4>${key}:</h4><div style="margin-left: 20px;">${renderJSON(value)}</div></div></div>`;
      } else if (Array.isArray(value)) {
        // Check if the array is for image links
        if (key === 'imageLinks') {
          htmlContent += `<div class="row"><div class="col-md-12"><h4>${key}:</h4></div></div>`;
          value.forEach(imgUrl => {
            htmlContent += `
                          <div class="row">
                              <div class="col-md-3">
                                  <img src="${imgUrl}" alt="Image" class="img-fluid">
                              </div>
                          </div>
                      `;
          });
        } else {
          htmlContent += `<div class="row"><div class="col-md-12"><h4>${key}:</h4><ul style="margin-left: 20px;">`;
          value.forEach(item => {
            if (typeof item === 'string' || typeof item === 'number') {
              htmlContent += `<li>${item}</li>`;
            } else if (typeof item === 'object') {
              htmlContent += `<li>${renderJSON(item)}</li>`;
            }
          });
          htmlContent += `</ul></div></div>`;
        }
      } else {
        // For other primitive data types, display them as key-value pairs
        htmlContent += `<div class="row"><div class="col-md-12"><p><span class="key">${key}:</span> ${value}</p></div></div>`;
      }
    }
  }
  return htmlContent;
}
function calculateDistanceAndShowMap(buyerPostalCode, sellerPostalCode, map, distanceLabel) {
  Promise.all([
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(buyerPostalCode)}`)
      .then(response => response.json()),
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sellerPostalCode)}`)
      .then(response => response.json())
  ])
    .then(([buyerData, sellerData]) => {
      if (buyerData.length > 0 && sellerData.length > 0) {
        const buyerLat = parseFloat(buyerData[0].lat);
        const buyerLon = parseFloat(buyerData[0].lon);
        const sellerLat = parseFloat(sellerData[0].lat);
        const sellerLon = parseFloat(sellerData[0].lon);

        // Haversine formula to calculate distance (in kilometers)
        const R = 6371; // Earth's radius in kilometers
        const dLat = (sellerLat - buyerLat) * Math.PI / 180;
        const dLon = (sellerLon - buyerLon) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(buyerLat * Math.PI / 180) * Math.cos(sellerLat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        distanceLabel.textContent = `How far from seller: ${distance.toFixed(2)} km`;

        // Update map
        const buyerCoords = ol.proj.fromLonLat([buyerLon, buyerLat]);
        const sellerCoords = ol.proj.fromLonLat([sellerLon, sellerLat]);

        const layer = new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [
              new ol.Feature({
                geometry: new ol.geom.Point(buyerCoords),
                name: 'Your Location'
              }),
              new ol.Feature({
                geometry: new ol.geom.Point(sellerCoords),
                name: 'Seller Location'
              })
            ]
          }),
          style: new ol.style.Style({
            image: new ol.style.Circle({
              radius: 6,
              fill: new ol.style.Fill({ color: buyerCoords === sellerCoords ? '#ffcc00' : '#2980b9' }), // Blue for buyer, yellow if same
              stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            })
          })
        });
        map.addLayer(layer);

        const extent = ol.extent.boundingExtent([buyerCoords, sellerCoords]);
        map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
      } else {
        distanceLabel.textContent = 'How far from seller: Unable to locate';
      }
    })
    .catch(err => {
      distanceLabel.textContent = 'How far from seller: Error calculating';
      console.error('Nominatim API error:', err);
    });
}


async function onlineDetail(myBook) {
  console.log(myBook);

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${myBook.bookName}`, {
      method: 'GET'
    });


    const onlineBookView = await response.json();
    console.log(onlineBookView);

    if (onlineBookView.items) {
      console.log(onlineBookView.items[1].volumeInfo);

      const reviewsContainer = document.getElementById("reviewsContainer");
      reviewsContainer.innerHTML = renderJSON(onlineBookView.items[0].volumeInfo);

    } else {
      errorDiv.textContent = data.message || 'Failed to load OnlineBook details.';
      errorDiv.style.display = 'block';
    }
  } catch (err) {
    errorDiv.textContent = 'Error loading myBook details.';
    errorDiv.style.display = 'block';

  }
}

async function editBook() {

  window.location.href = `/edit-myBook/${bookId}`;

}
async function deleteBook() {
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  deleteModal.show();

  document.getElementById('confirmDelete').addEventListener('click', async () => {
    try {
      const response = await fetch(`/api/book/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        window.location.href = '/'; // Redirect after successful deletion
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete book');
      }
    } catch (err) {
      alert('Error deleting book');
      console.error('Delete error:', err);
    } finally {
      // Hide the modal after operation
      const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
      deleteModal.hide();
    }
  });
}