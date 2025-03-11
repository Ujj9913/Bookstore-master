// public/js/edit-profile.js
document.addEventListener('DOMContentLoaded', async () => {
  const profileImagePreview = document.getElementById('profileImagePreview');
  const nameInput = document.getElementById('name');
  const numberInput = document.getElementById('number');
  const addressInput = document.getElementById('address');
  const postcodeInput = document.getElementById('postcode');
  const emailInput = document.getElementById('email');
  const interestedBooksSelect = document.getElementById('interestedBooks');
  const cartoonLogoSelect = document.getElementById('cartoonLogo');
  const editProfileForm = document.getElementById('editProfileForm');
  const editProfileError = document.getElementById('editProfileError');
  const token = localStorage.getItem('token');

  // Mapping of cartoonLogo to URL (replace with real URLs from free image sources)
  const cartoonUrls = {
    cat: 'https://media-hosting.imagekit.io//0f593923344a43d6/cat.jpeg?Expires=1835982747&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Av9Zf65AAAmAWwhKtkfpGcdsJtCwx4~rOLehcJlA9jxxiFPHaVQDNlydD7q9wrTPzHKR4GH69uaGDWw2HbpPIbuIsLTW9252rdf7oRDkE-vxclhCDT~cwy1KIdK7O2uthxb77xToUPOCHLD-pgyCmfFo~sZhjpyFno~17GV7-xYr1a~iQSkgi-SUldLOgj9DIbANwtgRnqF9ve7YyfeqOPpsyH89sFgqcAb7vbaEmvQi6a8oX9En9Fx0macHeaiuat8BJrtLfziu8Gu2gbHDU2~uaCTbyynCKrngudIlnp9AYvILbzYfPsSIjQj5pwvBa347Uf9-~JV~c3U~B75rYg__',
    dog: 'https://media-hosting.imagekit.io//d97b52f5826f4306/dog.png?Expires=1835982684&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=D~zVxjin86ZwZ8rbcEDu4G-KlzIIuyPLXuvZk94RYun4mr5qwADw8sUAoxJQ3z9QvGStFAjv32vXWE4D0GkGhAqan7ngWM93UPszoPLrAvjOBiXJfRvi661njJPZD7VzckNmL15oVhDiiyzrfZocLSzCMLG6SX48f~KmI5B0sGz2Zg9w7BTDLhIBEhLjNBpJkN2QfFAov-FLWdXCeqhMHTIxHSxaTdFqnOjTn6wv8kDYR1kxfgiWsmEw2SBnaDoxwWJAgx2T0gN8OtbwxV1sl0a6lrAP8NxrN5T3nrXIayAzAWVaoy4IX9oXJCwgSwxCJUbChBJzNWAJU56OAtXOOQ__',
    rabbit: 'https://media-hosting.imagekit.io//ac657c487c5740de/rabbit.png?Expires=1835982694&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Fx5SyFDl0zkJ4kogxVJEEn4dHhnFs~E~AoTWMbjfaWlN4VOHIl0CEKns~Gf1JqLfGhhBbZpvIxWWFBS12AF8MjsUSHga34R4~xPOTrPrMAv8rSuB2nLO5Kj5DP0OZVZ8LDsu4SWAHjZf~KnVOn-t7sEiISeBXUUsNCffp6VmAX2sHwT3aHDrgz5UFRuqlKSFFPcWoNXl~a1tQdGh09jQZnnDgzYEAfasRe7RKMUGM~dvpO4e-uOraSUZI3PrFzbD~BJ3pWUY7sm~~QKxQPwMp1bvVvjJ2I0VzUhQPr9Iu745PXEgGPJtof6e7MZy5CKdsLf1OhTqjhHmxTluRmHbRg__',
    bear: 'https://media-hosting.imagekit.io//4b8a81f7bd764109/dear.png?Expires=1835982674&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=nb78KpvqDwp98ImftA3s~za-Nv~HOYsIgFlGcCTqZwVGu9Y~xxCIZuX5MrGj5kg4jrN4O3QXLVFw1CudUOoPti9BSyvXU4Qm7WToopDVPE03LMNBb2UbuiFUvcrCY3QckcoqhnRjr5Csvyq6WGhnD~j6KKpeZ7ZqtrDYXryQuez9nNmhd2q-WEbRLAVHg8Yg88yQK-ip6vbybs90FQz5IabNksUowufkG6KUpIcozkpnfoF7tmyZb6dRxeyha581260ZBWGeE3G6dXMb9S8Po9P6O7h-DwH2VPn~h5Clg~KaX7rlwvXYbmUshDNiIyfOm~rDuFpmJ3Hdd4jCf2YB~A__',
    skybird: 'https://media-hosting.imagekit.io//cdf1a3c839054c09/bird.png?Expires=1835982497&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=pbiqPsV3E9QfPgBERqv0w3Sdj9st3Lbp3CzF8WLQ5FEDP2ajsWAtvv76YEBf3Lk~sVnXFp63bD4T1lXxeYep0-gI0HSK9hQGfIyPR1-fQ-~tRMxonS2r2uQG2aR~YH5yRN16QTiF5SaBJjcSxMK8eJAQ2SI2X9RyLu5FJvSN6OjJ9dqG6UWOtSz1obkpzLtQTkaXuYGaDtoo4sxYr5GZ01orLzE7TSYHaRridaRFM4k04d2QoQq8OOh~8P9asM4Nsn4r9jak~t~L-5UORA3DgYI8VNra34NP3DhXZ6nLeCwtH6-uy4fQHj-pXqTCZXd2asXZu91eSY1bgphAZFhQpA__',
    seeAnimal: 'https://media-hosting.imagekit.io//183a8c0ab27b431a/seaanimal.png?Expires=1835984691&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=fHxi884GYRNlP47dQpbXvi5tpQ0m1cBLX9RU4a30k~lEzUaoYfGgYVV-9sIXOjS2AZ97DiB4lYjhyuXVYV8oPy-DDr3q0TAVpQ7Q4SbW9nMUS6Vl57yEP371MIQxtTB3yJcVpvjSvrxYlzLwSmOQbHNEk6mjhBkYdIIsxfWD2Ni0jebpsgdJl~tkTBTaiEKLxG4r0oVvAs-aFVdRxQg8VJEIznEgHzfLHE5yP7qID316uIXqpnhudRRBvSkZYHC-e0IIYr4ezCE89OtUuqQwoXieMNNn1Y4rONbWXUFZKAAG1fl7pWwc657ya~BzvqO3lau~QuEbdkEEmUTkiJJYSg__',
    pug: 'https://media-hosting.imagekit.io//f896d1c965bf4921/smalldog.png?Expires=1835984672&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=R6Pia6cNw7r8w0Nc-UeNqcB86h6p6p9DIk8SSIro0JPrDNPq-Osku1NqqBKDnZblMlJIkMBfevEVzY5DqHq9He37nCoNeWhn3WlEAARk6oW8EjqfOj~hEsyXurkPv0yCWAZXSJ~FXWLr4CAL3m5QucvFnQQx5YBZzOyNYtwcnttqwtQ6Q3qMlYvF~ZJOSltgVCvDtY9LN7BZ1ctL1A3Ih4tWDCZKHek-eddbQkyVcC6j8bNTRMiG0w5iSvjzcwT8IZlMAST80jlco1NisVCDZGAYtXs1WvOySnVh8254EkEHg~vvEPi4nQ4LIv~rZN3AvZqsAEUuru53nnt88yTXrg__',
    lion: 'https://media-hosting.imagekit.io//fde20e130ab54445/lion.png?Expires=1835984663&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=UekN6iTrTxvZyvnaf~OBUA-A6B0dLWz767Q89JixUanD2TAyQXfmCk2GQoeU7j78VltaohGz9YC6gfco53P2k6ch0cYowPIG3F8vtpkKzBZir5nyDI7w30FyanSlTbPpmKa1GKSiCrwh-gvMqAFvDCWiXnEQ93UOShzJOlFmhKROhhuoTItSLvitzZMbwm1F2NP7yjHcNjOHW5XT4cXD0tb2zDvobRNGP15lzM6zcAG4R-zldxTrqFd25lzSsOVUe~mCXLp4-Gy8GdYOlMFFzxp3JN0WQ3IsWkM9ETAPMDwzG3o9kXv7G0i0cyXhC9lU1lf9kOZe3xnQHHT07pfwSQ__'
  };

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

    if (data.ReturnCode == 200) {
      const user = data.Data;
      profileImagePreview.src = cartoonUrls[user.profile_img] || cartoonUrls['cat'];
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

      // Pre-select cartoon logo
      if (user.profile_img) {
        cartoonLogoSelect.value = user.profile_img;
        profileImagePreview.src = cartoonUrls[user.profile_img];
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

  // Update preview when cartoon logo changes
  if (cartoonLogoSelect) {
    // Update preview when cartoon logo changes
    cartoonLogoSelect.addEventListener('change', () => {
      const selectedLogo = cartoonLogoSelect.value;
      console.log('Selected cartoonLogo:', selectedLogo); // Debug log
      const newUrl = cartoonUrls[selectedLogo] || cartoonUrls['cat'];
      console.log('New URL:', newUrl); // Debug log
      profileImagePreview.src = newUrl;
    });
  } else {
    console.error('cartoonLogoSelect element not found');
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
    const profile_img = cartoonLogoSelect.value;

    const dataToSend = {
      name,
      number,
      address,
      postcode,
      interestedBooks: interestedBooks,
      profile_img
    };

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
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