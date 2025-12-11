// Basic client-side app to load Steelers picks from CSV and display details

const CSV_FILE = 'Steeler Picks.csv';

let players = [];

async function loadCSV() {
  return new Promise((resolve, reject) => {
    Papa.parse(CSV_FILE, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}


function renderList(data) {
  const list = document.getElementById('playerList');
  const dropdown = document.getElementById('playerDropdown');
  list.innerHTML = '';
  dropdown.innerHTML = '<option value="">Select a player...</option>';

  data.forEach((p, idx) => {
    const li = document.createElement('li');
    const name = p.Player || p.Name || `Player ${idx+1}`;
    const pos = p.Position ?? p.Pos ?? '';
    li.textContent = pos ? `${name} (${pos})` : name;
    li.addEventListener('click', () => selectPlayer(p));
    list.appendChild(li);

    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = pos ? `${name} (${pos})` : name;
    dropdown.appendChild(opt);
  });

  dropdown.addEventListener('change', (e) => {
    const i = parseInt(e.target.value, 10);
    if (!isNaN(i)) selectPlayer(data[i]);
  });
}

function setText(id, value) {
  document.getElementById(id).textContent = value ?? '';
}


async function selectPlayer(p) {
  // Reveal details and dropdown on first selection
  document.querySelector('.details').hidden = false;
  const dropdown = document.getElementById('playerDropdown');
  dropdown.hidden = false;
  // Hide sidebar list and expand main content area
  const sidebar = document.getElementById('sidebar');
  if (sidebar && !sidebar.hidden) {
    sidebar.hidden = true;
    document.querySelector('main').classList.add('expanded');
    // Initialize map on-demand (or recreate) to avoid rendering issues
  }

  setText('playerName', p.Player || p.Name || 'Unknown');
  setText('round', p.Round ?? p.Rnd ?? '');
  setText('pick', p.Ovr_Pick_No ?? p.Pick ?? '');
  setText('position', p.Position ?? p.Pos ?? '');
  setText('college', p.College ?? '');
  setText('notes', p.Notes ?? '');

  // Show photo if a supported URL column exists (e.g., Photo, ImageURL, Picture)
  const photoRow = document.getElementById('photoRow');
  const img = document.getElementById('playerPhoto');
  // Known photo URLs by player name
  const photoMap = {
    'Derrick Harmon': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4682980.png&w=350&h=254',
    'Kaleb Johnson': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4819231.png&w=350&h=254',
    'Jack Sawyer': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4431590.png&w=350&h=254',
    'Yahya Black': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4430947.png&w=350&h=254',
    'Will Howard': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4429955.png&w=350&h=254',
    'Carson Bruener': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4429490.png&w=350&h=254',
    'Donte Kent': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4608004.png&w=350&h=254',
  };
  const defaultPhoto = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pittsburgh_Steelers_logo.svg/2560px-Pittsburgh_Steelers_logo.svg.png';
  const nameForPhoto = p.Player || p.Name || '';
  const photoUrl = p.Photo || p.ImageURL || p.Picture || p.Image || photoMap[nameForPhoto] || defaultPhoto;
  img.src = photoUrl;
  img.alt = `${p.Player || p.Name || 'Player'} photo`;
  photoRow.hidden = false;

  // Profile link mapping (ESPN player pages)
  const profileLinks = {
    'Derrick Harmon': 'https://www.espn.com/nfl/player/_/id/4682980/derrick-harmon',
    'Kaleb Johnson': 'https://www.espn.com/nfl/player/_/id/4819231/kaleb-johnson',
    'Jack Sawyer': 'https://www.espn.com/nfl/player/_/id/4431590/jack-sawyer',
    'Yahya Black': 'https://www.espn.com/nfl/player/_/id/4430947/yahya-black',
    'Will Howard': 'https://www.espn.com/nfl/player/_/id/4429955/will-howard',
    'Carson Bruener': 'https://www.espn.com/nfl/player/_/id/4429490/carson-bruener',
    'Donte Kent': 'https://www.espn.com/nfl/player/_/id/4608004/donte-kent',
  };
  const linksRow = document.getElementById('linksRow');
  const profileLink = document.getElementById('profileLink');
  const name = p.Player || p.Name || '';
  if (name && profileLinks[name]) {
    profileLink.href = profileLinks[name];
    profileLink.textContent = 'View ESPN profile';
    linksRow.hidden = false;
  } else {
    // If CSV provides a direct ProfileURL column, use it too
    const directUrl = p.ProfileURL || p.Profile || '';
    if (directUrl) {
      profileLink.href = directUrl;
      profileLink.textContent = 'View profile';
      linksRow.hidden = false;
    } else {
      linksRow.hidden = true;
    }
  }

}

async function main() {
  try {
    players = await loadCSV();
    renderList(players);
    // Set default photo before any selection
    const photoRow = document.getElementById('photoRow');
    const img = document.getElementById('playerPhoto');
    const defaultPhoto = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pittsburgh_Steelers_logo.svg/2560px-Pittsburgh_Steelers_logo.svg.png';
    if (img) {
      img.src = defaultPhoto;
      img.alt = 'Pittsburgh Steelers logo';
    }
    if (photoRow) {
      photoRow.hidden = false;
    }
    // Keep map size correct on window resize
  } catch (e) {
    console.error('Failed to load CSV', e);
    alert('Failed to load Steeler Picks.csv. Ensure the file exists at the project root.');
  }
}

window.addEventListener('DOMContentLoaded', main);
