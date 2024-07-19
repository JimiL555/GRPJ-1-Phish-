const apiKeyPhishNet = 'BABBB392A004EB644BF9';

document.getElementById('search-button').addEventListener('click', async () => {
  const date = document.getElementById('date-input').value;
  if (!date) {
    alert('Please select a date.');
    return;
  }

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<p>Loading...</p>';

  try {
    const setlistData = await fetchSetlist(date);
    console.log('Setlist Data:', setlistData);
    if (setlistData && setlistData.length > 0) {
      const showid = setlistData[0].showid;
      const reviewsData = await fetchReviews(showid);
      console.log('Reviews Data:', reviewsData);
      displayResults(setlistData, reviewsData);
    } else {
      resultsDiv.innerHTML = '<p>No setlist found for this date.</p>';
    }
  } catch (error) {
    console.error('Error:', error);
    resultsDiv.innerHTML = '<p>Error loading data. Please try again.</p>';
  }
});

async function fetchSetlist(date) {
  try {
    const response = await fetch(`https://api.phish.net/v3/setlists/get?apikey=${apiKeyPhishNet}&showdate=${date}`);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    console.log('Fetch Setlist Response:', data);
    return data.response.data;
  } catch (error) {
    console.error('Fetch Setlist Error:', error);
    throw error;
  }
}

async function fetchReviews(showid) {
  try {
    const response = await fetch(`https://api.phish.net/v5/reviews/showid/${showid}.json?apikey=${apiKeyPhishNet}`);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    console.log('Fetch Reviews Response:', data);
    return data.data; // Correctly accessing the data property
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    throw error;
  }
}

function parseSetlistData(setlistHtml) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = setlistHtml;
  const songs = [...tempDiv.querySelectorAll('.setlist > p')].map(p => p.textContent.trim());
  return songs;
}

function displayResults(setlistData, reviewsData) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (!setlistData || setlistData.length === 0) {
    resultsDiv.innerHTML = '<p>No setlist found for this date.</p>';
    return;
  }

  const setlist = setlistData[0];
  console.log('Setlist:', setlist);

  if (!setlist.setlistdata) {
    resultsDiv.innerHTML = '<p>Invalid setlist data format.</p>';
    return;
  }

  const songs = parseSetlistData(setlist.setlistdata);
  resultsDiv.innerHTML = `
    <h2 class="title">${setlist.venue || 'Unknown Venue'} - ${setlist.showdate}</h2>
    <ul>
      ${songs.map(song => `<li>${song}</li>`).join('')}
    </ul>
    <button class="button is-info" id="more-info-button">More Info</button>
  `;

  document.getElementById('more-info-button').addEventListener('click', () => {
    showModal(reviewsData);
  });
}

function showModal(reviewsData) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content');
  if (!reviewsData || !Array.isArray(reviewsData)) {
    modalContent.innerHTML = '<p>No reviews available.</p>';
  } else {
    modalContent.innerHTML = reviewsData.map(review => {
      console.log('Review:', review);  // Log each review to see its structure
      return `<p>${review.review_text || 'No review text available'}</p>`;
    }).join('');
  }
  modal.classList.add('is-active');

  document.querySelector('.modal-close').addEventListener('click', () => {
    modal.classList.remove('is-active');
  });
}