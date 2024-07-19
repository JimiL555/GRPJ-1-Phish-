// script.js

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
    if (setlistData && setlistData.length > 0) {
      const showid = setlistData[0].showid;
      const reviewsData = await fetchReviews(showid);
      displayResults(setlistData, reviewsData);
    } else {
      resultsDiv.innerHTML = '<p>No setlist found for this date.</p>';
    }
  } catch (error) {
    resultsDiv.innerHTML = '<p>Error loading data. Please try again.</p>';
  }
});

document.getElementById('play-song-button').addEventListener('click', () => {
  const audioElement = document.getElementById('designated-song');
  audioElement.play();
});

async function fetchSetlist(date) {
  try {
    const response = await fetch(`https://api.phish.net/v3/setlists/get?apikey=${apiKeyPhishNet}&showdate=${date}`);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    return data.response.data;
  } catch (error) {
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
    return data.data;
  } catch (error) {
    throw error;
  }
}

function parseSetlistData(setlistHtml) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = setlistHtml;
  const songs = [...tempDiv.querySelectorAll('p')].map(p => p.textContent.trim());
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
      return `<p>${review.review_text || 'No review text available'}</p>`;
    }).join('');
  }
  modal.classList.add('is-active');

  const closeModalButtons = document.querySelectorAll('.modal-close');
  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      modal.classList.remove('is-active');
    });
  });
}