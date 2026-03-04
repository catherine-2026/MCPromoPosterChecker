const scriptURL = 'https://script.google.com/macros/s/AKfycbyI7epkmu6iA40X-AymuuYDPWuNXo9CHtjSmRFqXePthWq0g-bHTonazKJExyr1_Ie-/exec';

// 1. Load data when page opens
document.addEventListener("DOMContentLoaded", function() {
  loadPosts();
});

function loadPosts() {
  const container = document.getElementById('forumPosts');
  
  fetch(scriptURL)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = ""; 
      if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">No feedback shared yet.</p>';
      } else {
        data.reverse().forEach(row => {
          renderPost(row[0], row[1], row[2]);
        });
      }
    })
    .catch(err => {
      console.log("Load Error:", err);
      container.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Ready for the first post!</p>';
    });
}

// 2. The Post Function
function postFeedback() {
  const nameInput = document.getElementById('userName');
  const feedbackInput = document.getElementById('feedbackInput'); // Updated ID to match HTML
  const btn = document.getElementById('submitBtn');

  const name = nameInput.value.trim();
  const feedback = feedbackInput.value.trim();

  if (!name || !feedback) {
    alert("Please enter both Name and Feedback!");
    return;
  }

  // Visual feedback that button was clicked
  btn.disabled = true;
  btn.innerText = "Sending...";

  const payload = JSON.stringify({ name: name, feedback: feedback });

  fetch(scriptURL, {
    method: 'POST',
    mode: 'no-cors', 
    body: payload
  })
  .then(() => {
    // Show on screen immediately
    renderPost(name, feedback, "Just now");
    
    // Clear form
    nameInput.value = "";
    feedbackInput.value = "";
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
    alert("Success! Check your Google Sheet now.");
  })
  .catch(error => {
    console.error('Error!', error);
    btn.disabled = false;
    btn.innerText = "Post to Sharing Pool";
    alert("Connection error. Try again.");
  });
}

function renderPost(name, text, time) {
  const container = document.getElementById('forumPosts');
  const post = document.createElement('div');
  post.className = 'feedback-entry';
  
  post.innerHTML = `
    <div class="entry-header">
      <span class="entry-name">👤 ${name}</span>
      <span class="entry-date">${time}</span>
    </div>
    <div class="entry-text">${text}</div>
  `;
  container.prepend(post);
}